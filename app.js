// index.js
const express = require('express')
const path = require('path')
const { logger } = require('./logger')
const reports_repo = require('./reports-repo')


const port = 8080

const app = express()


// to server static pages
app.use(express.static(path.join(__dirname, '/static')))

// for POST json 
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/reports', async(req, res) => {
    // http://localhost:8088/speed=130
    const speed = req.query.speed
    if (speed) {
        if (isNaN(Number(req.query.speed))) {
            logger.error(`a user tried to use a number query param but not wrote a number - ${req.query.speed}`)
            res.writeHead(400);
            res.end(`${req.query.speed} is not a number`)
            return;
        }
        else {
            const reports = await reports_repo.getReportsByCondition('speed', speed); 
            res.status(200).json({ reports })
            return;
        }
    }
    const reports = await reports_repo.getAllReports(); 
    res.status(200).json({ reports })
});

app.get('/reports/:report_id', async(req, res) => {
    const report_id = req.params.report_id
    const report = await reports_repo.getReportById(report_id); 
    res.status(200).json({ report })
});

app.delete('/reports/:report_id', async(req, res) => {
    try
    {
        const report_id = req.params.report_id
        const result = await reports_repo.deleteReport(report_id)
        res.status(200).json({
            res: 'success',
            url: `localhost:8080/reports/${report_id}`,
            result
        })
    }
    catch(e) {
        logger.error(`a user tried to delete a report with id ${report_id} but an error catched - ${e}`)
        res.status(400).send({
            status: 'fail',
            message: e.message
        })
    }
});

app.put('/reports/:report_id', async(req, res) => {
    try
    {
        const report_id = req.params.report_id
        const report = req.body
        const result = await reports_repo.updateReport(report, report_id)
        res.status(201).json({
            res: 'success',
            url: `localhost:8080/employee/${report_id}`,
            result
        })
    }
    catch(e) {
        logger.error(`a user tried to update a report with id ${report_id} to this - ${req.body} but an error catched - ${e}`)
        res.status(400).send({
            status: 'fail',
            message: e.message
        })
    }
});

app.post('/reports', async (req, res) => {
    try
    {
        const new_report = req.body
        const result = await reports_repo.addReport(new_report)
        res.status(201).json({
            res: 'success',
            url: `localhost:8080/reports/${result[0]}`,
            result
        })
    }
    catch(e) {
        logger.error(`a user tried to post a new report - ${new_report} but an error catched - ${e}`)
        res.status(400).send({
            status: 'fail',
            message: e.message
        })
    }
})

app.listen(port, () => console.log(`Listening to port ${port}`))