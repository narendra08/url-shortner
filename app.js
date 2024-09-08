const { default: cli } = require('@angular/cli');
const express = require('express');
const redis = require('redis');
const shortid = require('shortid');
const app = express();

const client = redis.createClient({
    host:'localhost',
    port:6379
});
client.connect().catch(err => {
    console.error('Error connecting to Redis:', err);
});
app.use(express.json());
app.listen(3000,()=>{
    console.log('app connected');
})

app.post('/shorten',async (req,res)=>{
    const {longUrl}= req.body;

    if(!longUrl){
        res.status(212).json({
            msg:"INVALID URL FORMAT"
        })
    }

    const shorturl = shortid.generate(longUrl);
try{
    await client.set(shorturl,longUrl,(err,data)=>{
        if (err) {
            return res.status(500).json({ error: 'Error saving to Redis' });
        }
        res.json({ shorturl: `http://localhost:${port}/${shortUrl}` });
    })
}catch(err){
    console.log(err)
    return res.status(404).json({ error: 'Short URL not found' });
}
    
})

app.get('/:shortUrl',(req,res)=>{
    const { shortUrl } = req.params;

    // Fetch the original long URL from Redis
    client.get(shortUrl, (err, longUrl) => {
        if (err || !longUrl) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        res.redirect(longUrl); // Redirect to the original URL
    });
})
