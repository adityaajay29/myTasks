const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");

// adding database to our app
const mongoose = require("mongoose");
const { getDate } = require("./date");

// setting server to use ejs
// it will get hold of the ejs pages
// when they are in views folder on our working directory
// so, we will add all our ejs files in the views folder

app.set("view engine", "ejs");

// using bodyParser to req data back to the server from the page

app.use(bodyParser.urlencoded({extended : true}));


// since our website is no more static, we need to use 
// an express object, called static to tell the server
// to access static files like css, from a given folder
app.use(express.static("public"));

// to store the to do items
var items=["leetcode", "web dev"];

// creating new DB :

mongoose.connect("mongodb+srv://adityaajay29:Ganesha123@adityacluster.wlqt1.mongodb.net/toDoListProjectDB?retryWrites=true&w=majority", {useNewUrlParser: true});

const listSchema = new mongoose.Schema(
    {
        name : String
    }
);

// creating a new model using the schema

const Item = mongoose.model("Item", listSchema);

// creating default items to render in the list, in the collection called Items

const Item1 = new Item(
    {
        name : "leetcode (e.g.)"
    }
)

const Item2 = new Item(
    {
        name : "Development (e.g.)"
    }
)

const defaultItems = [Item1, Item2];

// creating new schema for custom lists, which will be used by all the custom pages

const customSchema = {
    name : String, 
    items : [listSchema]
};

// creating new model of customSchema for custom lists, which will be used by all the custom pages

const CustomList = mongoose.model("CustomList", customSchema);

app.get("/", function(req, res)
{
    const day = getDate();
    // since we want to insert default items to our todo list only for the first time
    // we will check if the collection is empty or not, if yes, then only 
    // we will add the default items to the collection "Item"

    // looking if the Item collection is empty or not
    Item.find({}, function(err, foundItems)
    {
        if(foundItems.length === 0)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                Item.insertMany(defaultItems, function(err)
                {
                    if(err)
                    console.log(err);
                    else
                    console.log("Successfully added default items to Item Collection");
                });
            }
        }
        // in ejs, we use render to respond to whatever we want to
        // we want to render the content to list.ejs, so using that as a parameter
        // along with the variable items : today's date, and the to do list

        res.render("list", {kindOfDay : day, listTitle : "Today", addNewItems : foundItems});
    });
});

// creating a get method for custom pages for different to do lists

app.get("/:customListName", function(req, res)
{
    const day = getDate();

    // using lodash to convert any listName to Capitalised form for easy access
    const customListName = _.capitalize(req.params.customListName);

    CustomList.findOne({name : customListName}, function(err, foundName)
    {
        if(!err)
        {
            if(!foundName)
            {
                const list = new CustomList(
                    {
                        name : customListName,
                        items : defaultItems
                    }
                );
                list.save();
                res.redirect("/" + customListName);
            }
            else
            {
                res.render("list", {kindOfDay : day, listTitle : foundName.name, addNewItems : foundName.items});
            }
        }
    });       
});

app.post("/", function(req, res)
{

    // getting data from form named newItem
    const itemName = req.body.newItem;
    const listName = req.body.list;

    // adding new Item to our "Item" collection
    newItem = new Item(
        {
            name : itemName
        }
    );

    // if we are on home route, then add the items to home route list
    if(listName === "Today")
    {
        newItem.save();
        // redirecting the post response back to our root route so that it can be added to the list of new items
        res.redirect("/");
    }
    // else add the item to the "listName" list
    else
    {
        CustomList.findOne({name : listName}, function(err, foundList)
        {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

// to delete a particular item, we need to have hold of what is returned on clicking the checkbox
// for that, we need a new post method for deletion

app.post("/delete", function(req, res)
{
    // getting hold of the item to be deleted
    const toDelete = req.body.itemToDelete;
    // using the hidden input in the form to to hold of the particular page
    const listName = req.body.listName; 

    if(listName === "Today")
    {
        // deleting the particular item using its "id"
        Item.deleteOne({_id : toDelete}, function(err)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Successfully deleted the selected item");
                // redirect to the home route after deletion
                res.redirect("/");
            }
        });
    }
    // deleting items from custom list
    else
    {
        CustomList.findOneAndUpdate({name : listName}, {$pull : {items : {_id : toDelete}}}, function(err, foundList)
        {
        if(!err)
        {
            res.redirect("/" + listName);
        }
        });
    }
});

// let port = process.env.PORT;
// // if port == null || port == "") {
// //   port = 3000;
// // }
// app.listen(port || 3000, function() {
//   console.log("Server has started Successfully on dynamic port");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function()
{
    console.log("server started successfully")
});