const express = require('express');
const app = express();
const compression = require('compression')

const port = process.env.PORT || 4000
const host = '0.0.0.0'

app.use(compression())
app.use(express.static("dist"))

app.listen(port, host, ()=>{
  console.log("server started!")
});