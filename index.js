import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;
const __dirname=dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.join(__dirname, 'uploads');

// Configure static file serving for the uploads directory
app.use('/uploads', express.static(uploadsDirectory));
app.use(express.json());
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const jsonData = fs.readFileSync('users.json', 'utf8');
// Parse the JSON data
const usersData = JSON.parse(jsonData);


function authenticateUser(username, password) {
    // Loop through the users array to find a matching username and password
    for (const user of usersData[0].users) {
      if (user.username === username && user.password === password) {
        return true; // Authentication successful
      }
    }
    return false; // No matching username and password found
  }
  let flag=0;
app.get('/', (req, res) => {
    res.render('home.ejs',{
       f:flag
    });
});
// upload.single('file') 
app.post('/upload/:username',upload.single('file') ,(req, res) => {
    const { username } = req.params; // Assuming username is sent with the request
    const file = req.file;

    const uploadDirectory = `uploads/${username}`;

    // Create user directory if it doesn't exist
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    // Move the uploaded file to the user's directory
    fs.renameSync(file.path, `${uploadDirectory}/${file.originalname}`);

    res.send('File uploaded successfully.');
});

function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
      case 'jpg':
      case 'jpeg':
          return 'image/jpeg';
      case 'png':
          return 'image/png';
      case 'gif':
          return 'image/gif';
      case 'txt':
          return 'image/txt';
      default:
          return 'application/octet-stream'; // Default to binary data
  }
}

app.get('/download/:username/:filename', (req, res) => {
  const { username, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', username, filename);
  
  // Send the file as an attachment
  res.download(filePath, filename, (err) => {
      if (err) {
          console.error('Error downloading file:', err);
          res.status(404).send('File not found.');
      }
  });
});

class User {
    constructor(username, password) {
      this.username = username;
      this.password = password;
    }
}

app.get('/register',(req,res)=>{
    res.render('signup.ejs',{

    });
});

app.post('/signup',(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    
    // const Data = fs.readFileSync('users.json', 'utf8');
// Parse the JSON data
    // const Users = JSON.parse(Data);

    const user = new User(username,password);

    usersData[0].users.push(user);
    // console.log(JSON.stringify(Users));
    fs.writeFileSync('users.json',JSON.stringify(usersData));

    res.send("User successfully registered!");
});


app.post('/login', (req, res) => {
    
    // console.log(JSON.stringify(usersData));
      // Example usage
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
      
    if (authenticateUser(inputUsername, inputPassword)) {
        flag=0;
        // const data=collection.inputUsername;
        // console.log(JSON.stringify(data));
        let userFiles;
        console.log("Login successful!");
        const directory = `uploads/${inputUsername}`;
        let files = [];
try {
    // Read files from the user's directory
    const filenames = fs.readdirSync(directory);
    
    // Iterate over filenames and gather file data
    filenames.forEach(filename => {
        const filePath = `${directory}/${filename}`;
        const fileStats = fs.statSync(filePath);

        // Extract relevant file data
        const file = {
            filename: filename,
            type: getFileType(filename),
            size: fileStats.size // File size in bytes
        };

        // Push the file object to the files array
        files.push(file);
    });

        } catch (error) {
            console.error('Error reading files:', error);
        }

        // console.log(JSON.stringify(files));
        // console.log(JSON.stringify(collectionData));
        res.render('login.ejs',{
          files: files,
          username:inputUsername,
         });
        } 
    else {
        flag=1;
        console.log("Invalid username or password.");
        res.redirect('/');
        // res.render('home.ejs',{
        //     f:flag
        // });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});