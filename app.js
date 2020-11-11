var express			 = require('express'),
	multer			 = require('multer'),
	app 			 = express(),
	fs 				 = require('fs'),
{TesseractWorker} 	 = require('tesseract.js'), //npm install tesseract.js@2.0.0-alpha.15
	worker			 = new TesseractWorker(),
	bodyParser 	   	 = require("body-parser"),
	methodOverride   = require("method-override"),
	mongoose		 = require("mongoose");
	

app.use(express.static(__dirname + "/public"));//install express-static
mongoose.connect("mongodb+srv://gagan123:gagan123@cluster0.uax8b.mongodb.net/<dbname>?retryWrites=true&w=majority", {  //new_ocr  
//mongodb://localhost/new_ocr
	useNewUrlParser: true,
	useUnifiedTopology: true,
  	useCreateIndex: true,
    useFindAndModify: false });
app.use(bodyParser.urlencoded({extended : true})); //yaad kro to use body parser
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
extended: true
})); 
var cur;
//////Storage////////
var Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images");
  	},
 filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

var upload = multer({storage: Storage}).single("avatar");
////////////////////
//MONGOOSE/MODEL CONFIG
var dataSchema = new mongoose.Schema({
	text: String
})

var Data = mongoose.model("Data", dataSchema);

var formSchema = new mongoose.Schema({
	name: String,
	rollno: String,
	dept: String,
	user : String
})

var Form = mongoose.model("Form", formSchema);
/////////////////////

app.get('/landing', function(req, res){
  res.render('landing',{username:cur});
});

app.get('/login', function(req, res){
  res.render('login',{username:cur});
});

app.get('/home', function(req, res){
  res.render('index',{username:cur});
});

app.get('/', function(req, res){
	res.render('index',{username:cur});
  });

app.get('/view', function(req, res){
  Form.find({user:cur},function(err, alldata){
		if(err){
			console.log(err);
		}else{
			res.render("allforms", { forms : alldata ,username:cur});
		}
	})
});

//new form
app.get('/ocr', function(req, res){
	
  res.render('form',{username:cur});
});

//post route to save new form
app.post("/upload", function(req, res){
	upload(req, res, err => {
		fs.readFile(`./images/${req.file.originalname}`, function(err, data){
			if(err){
				console.log(err);
			}else {
				worker
					.recognize(data, "eng")
				//, {tessjs_create_pdf: '1'} to make pdf
					.progress(progress => {
						console.log(progress);
				})
					.then(result => {
					// res.redirect("/download");
					// res.send(result.text);
					console.log(result.text);
					// var p = result.text;
					// sort(p);
					var newData = {text : result.text};
					Data.create(newData,function(err, newtext){
						if(err){
						console.log(err);
						}else{
							res.render("show", {data: newtext,username:cur})	
							}	
					})
				})
					.finally(() => worker.terminate());
			}
		})
	})
})

//Sorting goes here
app.get("/sort/:id", function(req, res){
	//find the data with provided id
	Data.findById(req.params.id).exec(function(err,foundData){//.id can be .anything
		if(err){
			console.log(err);
		}else{
			var p = foundData.text;
			// sort(p);
			// p = p.toString();
			// p = p.replace(/[:]+/g, " ")
			// p = p.replace(/[ ]+/g, "_")
			// p = p.replace(/[A-Z]+/g, "$")
			// p = p.replace(/[_]+/g, " ")
			sort(p);
			res.redirect('/view');
			// res.render("sort", {p : p});
		}
	})
});

//View Form
app.post("/myform/:id", function(req, res){
	Form.findById(req.params.id).exec(function(err,foundData){
		if(err){
			console.log(err);
		}else{
			res.render("myform", {form : foundData,username:cur});
		}
	})
})

app.get("/myform/:id", function(req, res){
	Form.findById(req.params.id).exec(function(err,foundData){
		if(err){
			console.log(err);
		}else{
			res.render("myform", {form : foundData,username:cur});
		}
	})
})

//EDIT FORM ROUTE
app.get("/myform/:id/edit", function(req, res){
		//findById tells info of clicked campground and help in edits
		Form.findById(req.params.id, function(err, founddata){
			res.render("edit", {username:cur,data : founddata});
		})
});

//UPDATE FORM ROUTE
app.post("/myform/update/:id", function(req, res){
	
	console.log("Hello");
	Form.findByIdAndUpdate(req.params.id, {name : req.body.name,rollno:req.body.rollno,dept:req.body.dept}, function(err, UpdatedForm){
		if(err){
			res.send("Something went wrong...")
		} else{
			res.redirect("/myform/" + req.params.id )
			//instead of re.params.id UpdatedForm.id can be used
		}
	})
	//redirect somewhere
})

//DESTROY Form
app.delete("/myform/:id", function(req, res){
	Form.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.render("form",{username:cur})
		} else{
			res.render("form",{username:cur})
		}
	})
})


function sort(p){
	var s = p;
	var n = s.length;
	var l = 0; 
	var a1,a2,a3,a4,a5,a6;
	var a,b,c;
	for(var i = 0; i < n; i++) {
		if(s[i]=='$'&&l==0){
			var k = 2;
			a1 = k;
			while(s[k]!='$'){
				k++;
			} a2 = k-1; l++; k=k+2; // k+2 to skip $ and space
		var j = k;
			a3 = k;
			while(s[k]!='$'){
				k++;
			} a4 = k-1; k=k+2;
		j = k;
			a5 = k;
			while(k!=n){ // in end string this way
				k++;
			}
			a6 = k;
		}
	}
	function capitalize_Words(str)
	{
	 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	s = capitalize_Words(s);
	a = s.substring(a1,a2);
	b = s.substring(a3,a4);
	c = s.substring(a5,a6);

	var test = a.split('\n');

	

	console.log(test);
	console.log("jasmine");
	const newForm = new Form({name : test[0].split(':')[1], rollno : test[1].split(':')[1], dept : test[2].split(':')[1],user:cur});
	//create a new Form and save it in DB
	newForm.save();
}

// app.get("/download", function(req, res){
// 	var file = `${__dirname}/tesseract.js-ocr-result.pdf`;
// 	res.download(file);
// })

app.listen(5000, function(){
	console.log("Server ON");
})


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,

    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
const User = mongoose.model('user', userSchema)

app.post('/g_register',async function(req,res){
	let name = req.body.username
	let password = req.body.password
	let email = req.body.email
	let phone = req.body.phone

	let newuser = new User({
		name,
		email,
		phone,
		password
	  })
	
	  await newuser.save()
	  cur = name
	  res.render('form',{username:cur})
})

app.get('/register',function(req,res){
	res.render('signup')
})


app.post('/g_login',async function(req,res){
	try {
		let name = req.body.username
		let password = req.body.password
		
		const user = await User.find({name:name});
		
		if(user[0].password==password){
			cur = name
			res.render('form',{username:name})
		}
		else{
			res.send("Wrong password try again...")
		}
	} catch (error) {
		res.send("went wrong...")
	}
})

app.post('/g_logout',async function(req,res){
	try {
		cur = '';
		res.render("index")
	} catch (error) {
		
	}
})