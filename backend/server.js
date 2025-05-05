import { v2 as cloudinary } from 'cloudinary';

import { app } from './app.js';

const port=process.env.PORT;

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET
})

app.listen(port,()=>console.log(`server is running on ${port}`));