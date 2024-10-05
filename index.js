const express = require("express");
const fs = require("fs");
const path = require("path");

const myDate=new Date();

const app = express();

app.use(express.json());

const FilePath = path.join(__dirname, "data.json");



function ReadDataFromFile(FilePath, callback) {
  fs.readFile(FilePath, "utf-8", (err, content) => {
    callback(JSON.parse(content));
  });
}

function WriteDataToFile(FilePath, data, callback) {
  fs.readFile(FilePath, "utf-8", (err, content) => {
    const ParseContent = JSON.parse(content);
    var LastDataWithId;
    if (ParseContent.length < 1) {
      LastDataWithId = {
        id: 1,
        ...data,
      };
    } else {
      LastDataWithId = {
        id: ParseContent[ParseContent.length - 1].id + 1 ,
        ...data,
      };
    }

    ParseContent.push(LastDataWithId);
    
    fs.writeFile(FilePath, JSON.stringify(ParseContent), "utf-8", () => {
      console.log(`Done`);
    });
    callback();
  });
}

app.get("/api/Posts", (req, res) => {
  ReadDataFromFile(FilePath, (data) => {
    res.json(data);
  });
});

app.get("/api/Posts/:id", (req, res) => {
  const id = req.params.id;
  ReadDataFromFile(FilePath, (data) => {
    const FindPost = data.find((ele) => {
      return ele.id == id;
    });
    if(!FindPost){
      return res.json({"msg":"The Post Not Found"})
    }
    res.status(200).json(FindPost);
  });
});

app.post("/api/Posts", (req, res) => {
  // console.log(req.body);
  if(req.body.name.length<2){
    return res.status(400).json({msg:"The Name Required More Than Two Char"})
  }
  if(req.body.title.length<1){
    return res.status(400).json({msg:"The Title Required"})
  }
  if(req.body.desc.length<1){
    return res.status(400).json({msg:"The Desc Of Post Required"})  
  }
  const newPost = {date:myDate.toDateString(),...req.body};
  WriteDataToFile(FilePath, newPost, () => {
    res.status(201).json({ msg: "Added Done" });
  });
});

app.put("/api/Posts/:id", (req, res) => {
  const id = req.params.id;
  ReadDataFromFile(FilePath, (data) => {
    const IndexPost = data.findIndex((ele) => {
      return ele.id == id;
    });
    if (IndexPost == -1) {
      return res.status(400).json({msg:"The Post Not Found"});
      
    }
    console.log(data[IndexPost]);
    data[IndexPost]={...data[IndexPost],...req.body}
    fs.writeFile(FilePath, JSON.stringify(data), "utf-8", () => {
      res.status(200).send({ msg: "Updated Done" });
    });
  });
});

app.delete("/api/Posts/:id", (req, res) => {
  const id = req.params.id;
  ReadDataFromFile(FilePath, (data) => {
    const IndexPost = data.findIndex((ele) => {
      return ele.id == id;
    });
    if (IndexPost == -1) {
      return res.status(400).json({msg:"The Post Not Found"});
    }
    
    const DataAfterDelete = data.filter((ele) => {
      return ele.id != id;
    });
    fs.writeFile(FilePath, JSON.stringify(DataAfterDelete), "utf-8", () => {
      res.status(200).send({ msg: "Deleted Done" });
    });
  });
});

app.listen(3000);
