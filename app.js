const express = require('express');
const app = express();

const port = process.env.PORT || 4000
const host = '0.0.0.0'

app.use(express.static("dist"))

app.listen(port, host, ()=>{
  console.log("server started!")
});