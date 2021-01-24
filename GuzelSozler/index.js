const express    = require("express");
const bodyParser = require("body-parser");
const app        = express();
const mongoose   = require("mongoose");
const https      = require("https");
app.use(express.static(__dirname + "/dosyalar"));

const Schema = mongoose.Schema;

mongoose.connect("mongodb+srv://ahmet:1234@cluster0.iblch.mongodb.net/Cluster0?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology:true});


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended :true}));


const guzelSozSema = {
  kategori : String,
  icerik : String
};
const GuzelSoz = mongoose.model("GuzelSoz", guzelSozSema);
app.get("/", function(req, res){
  GuzelSoz.find({}, function(err, gelenSozler){
    res.render("anasayfa", {sozler : gelenSozler});
  });
});
app.route("/api/guzelsoz/:id")
    .get(function(req, res){
      GuzelSoz.findOne({_id : req.params.id} , function(err, gelenVeri){
        res.send(gelenVeri);
      });
    })
    .put(function(req, res){
      var kategoriGelen = req.body.kategori;
      var icerikGelen   = req.body.icerik;
      GuzelSoz.update({_id : req.params.id} , {kategori : kategoriGelen, icerik : icerikGelen}, {overwrite: true}, function(err){
        if(!err)
          res.send({sonuc : "Kayıt başarıyla güncellendi."});
        else
          res.send(err);
      });
    })
    .patch(function(req, res){
      GuzelSoz.update({_id : req.params.id} , {$set : req.body}, function(err){
        if(!err)
          res.send({sonuc : "Kayıt başarıyla güncellendi."});
        else
          res.send(err);
      })
    })
    .delete(function(req, res){
      var sifre = req.body.sifre;
      if(sifre == "parola1234"){
        GuzelSoz.deleteOne({_id : req.params.id}, function(err){
          if(!err)
            res.send({sonuc : "Kayıt başarıyla silindi."});
          else
            res.send(err);
        })
      }else{
        res.send({sonuc : "Şifre hatalı."});
      }
    });
app.route("/api/guzelsozler")
    .get(function(req, res){
      GuzelSoz.find({}, function(err, gelenVeri){
        if(!err)
          res.send(gelenVeri);
        else
           res.send(err);
      });
    })
    .post(function(req, res){
       var guzelSoz = new GuzelSoz({
         kategori : req.body.kategori,
         icerik : req.body.icerik
       });
       guzelSoz.save(function(err){
          if(!err)
            res.send( {sonuc : "Kayıt başarıyla oluşturuldu."} );
          else
            res.send(err);
       });
    })
    .delete(function(req, res){
      var sifre = req.body.sifre;
      if(sifre == "parola1234"){
        GuzelSoz.deleteMany({}, function(err){
          if(!err)
            res.send( {sonuc : "Tüm kayıtlar başarıyla silindi."} );
          else
            res.send(err);
        });
      }else{
        res.send({sonuc : "Şifre hatalı."});
      }
    });


app.get("/admin", function(req,res){

  var link ="https://guzelsozlerahmetyanik.herokuapp.com/api/guzelsozler";

  https.get(link, function(responce){


    responce.on("data",function(gelenGuzelSozler){

      var guzelSozler = JSON.parse(gelenGuzelSozler);
      res.render("admin",{sozler:guzelSozler});
    })
  })



});


app.post("/kayit-sil", function(req, res){
    var id = req.body._id;
    var link = "https://guzelsozler.herokuapp.com/api/guzelsoz/"+id;

    var gonderilecekler = JSON.stringify(

      {

        sifre:"parola1234"

      }

  );

    var secenekler = {
      method : 'DELETE',
      headers:{
        "Content-type":"application/json",
        "Content-Length" : gonderilecekler.length
      }
    };
    https.get(link, secenekler , function(response){
        response.on("data", function(gelenData){
          var sonuc = JSON.parse(gelenData);
          res.send(sonuc)
        })
    });
});


let port = process.env.PORT;
if(port == "" || port == null){
  port = 5000;
}
app.listen(port, function(){
  console.log("port numarasi : " + port);
});
