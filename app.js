//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://parvathysajeev21:Preethu123!@cluster0.qjw1bxl.mongodb.net/todolistDB',{useNewUrlParser:true});
 
const itemsSchema={
   name: String

};
const Item= mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to your todolist!"});

const item2 = new Item({
    name:"Hit the + button to add a new item."});

const item3 = new Item({
    name:"<-- Hit this to delete an item."});

const defaultItems = [item1,item2,item3];

const listSchema ={
 name:String,
 items:[itemsSchema]


};
const List=mongoose.model("List", listSchema);
let foundList;
app.get("/",async function(req, res) {

const foundItems = await Item.find({});
if (foundItems.length ===0){
  await Item.insertMany(
  defaultItems);

}else{
 

  res.render("list", {listTitle:"Today", newListItems: foundItems});
}
});

app.get("/:customListName",async function(req,res){
  const customListName = _.capitalize (req.params.customListName);
  foundList= await List.findOne({ name: customListName }).exec();
  
  if (!foundList){
  const list = new List({
  name:customListName,
  items:defaultItems

});
  await list.save();
  foundList=list;
  res.redirect("/" + customListName);
}else{

res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
}

});

app.post("/",async function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
       });
  if (listName ==="Today"){
   item.save();
  res.redirect("/");
} else{
 foundList= await List.findOne({ name: listName }).exec();
if (!foundList.items) {

  foundList.items =[];
}
 await foundList.items.push(item);
 await foundList.save();
  res.redirect("/" +listName);

}
});
  
  app.post("/delete",async function(req,res){
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;
if (listName === "Today"){
 await Item.findByIdAndDelete(checkedItemId);
   res.redirect("/");

}else{
try{
   await List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkedItemId}}});

      
        res.redirect("/" +listName);


} catch (err){
  console.error(err);
 res.redirect("/");
}
}
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
