//криво работает вход
// подключение библиотек 
let { log } = require("console")
let express = require("express") 
let server = express() 
let fse = require("fs-extra") 
const { dirname } = require("path") 
const { Socket } = require("socket.io") 
let http = require("http").createServer(server) 
let io = require("socket.io")(http) 
http.listen(3000) 

// подключение html 
server.get("/", function(req, res){ 
    res.sendFile(__dirname + "/index.html") 
}) 
// продключение css
server.use(express.static(__dirname + "/styles"))
// подключение базы данных и создание щетчиков id 
DataBase = fse.readJSONSync("DataBase.json") 
caunt_id_users = DataBase.users[DataBase.users.length-1].ID 
caunt_id_market = DataBase.markets[DataBase.markets.length-1].ID 
caunt_id_product = DataBase.products[DataBase.products.length-1].ID 
 
io.sockets.on("connection", function(socket){ 
    // вызов на проверку совподений логинов 
    socket.on("check_login_regist", function(login_regist){ 
        let check = true 
        for(let i = 0; i < DataBase.markets.length; i++){ 
            if(DataBase.markets[i].login == login_regist){ 
                check = false 
            } 
        } 
        for(let i = 0; i < DataBase.users.length; i++){ 
            if(DataBase.users[i].login == login_regist){ 
                check = false 
            } 
        } 
        socket.emit("answer_login_regist", check) //fddsadasdsdasdssadd
    }) 
 
  
    // вызов на создание логина 
    socket.on("registr", function(market_users){ 
        let id
        if(market_users.market_if == 1) 
        { 
            caunt_id_market++ 
            id = caunt_id_market

            delete market_users.market_if 
 
            market_users.ID = caunt_id_market 
             
            DataBase.markets.push(market_users) 
        }else{ 
            caunt_id_users++ 
            id = caunt_id_users

            delete market_users.market_if 
 
            market_users.ID = caunt_id_users 
            market_users.basket = []

            DataBase.users.push(market_users) 
        } 
        // перезапись базы данных 
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
        socket.emit("return_id", id)//dawdwadwadwadwadwdwadwadwadwdwadawdawdwadwadwadwadawdaw
    }) 
 
    // запрос на вход в акаунт 
    socket.on("enter", function(market_users){ 
        let market_or_user = 0 //0 незареган 1 маркет 2 юсер 3 админ 
        let user_id = -1
        // оптимизировать!!!
        if((DataBase.admin.login == market_users.login) && (DataBase.admin.password == market_users.password)){
            market_or_user = 3
        }
        for(let i = 0; i < DataBase.markets.length; i++){
            
            if(DataBase.markets[i].login == market_users.login){ 
                if(DataBase.markets[i].password == market_users.password){
                    user_id = DataBase.markets[i].ID
                    market_or_user = 1 
                }else{ 
                    break 
                } 
            } 
        } 
        for(let i = 0; i < DataBase.users.length; i++){ 
            if(DataBase.users[i].login == market_users.login){ 
                if(DataBase.users[i].password == market_users.password){
                    user_id = DataBase.users[i].ID
                    market_or_user = 2 
                }else{ 
                    break 
                } 
            } 
        }
        market_or_user_and_id = {
            "market_or_user": market_or_user,
            "thisid": user_id
        }
        socket.emit("enter_answer", market_or_user_and_id)



    })  
    socket.on("start_index", function(){
        socket.emit("return_product", DataBase.products)
    })
    socket.on("addgoods", function(goods_obj){
        caunt_id_product++
        goods_obj.ID = caunt_id_product
        DataBase.products.push(goods_obj)
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })
    socket.on("delite_products", function(id){
        for (let i = 0; i < DataBase.products.length; i++) {
            if(DataBase.products[i].ID == id){
                DataBase.products.splice(i, 1)
            } 
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })
    socket.on("push_basket", function(ID_product_and_user){
        let element_basket = {}
        for(let i = 0; i < DataBase.users.length; i++){
            if(ID_product_and_user.id_user == DataBase.users[i].ID){
                let switch_id = true
                for (let j = 0; j < DataBase.users[i].basket.length; j++){
                    if(DataBase.users[i].basket[j].ID == ID_product_and_user.id_product){
                        DataBase.users[i].basket[j].count++
                        switch_id = false
                        break
                    }
                }
                if(switch_id){
                    for(let j = 0; j < DataBase.products.length; j++){
                        if(DataBase.products[j].ID == ID_product_and_user.id_product){
                            console.log(DataBase.products[j])
                            element_basket.name = DataBase.products[j].name
                            element_basket.price = DataBase.products[j].price
                            element_basket.ID = DataBase.products[j].ID
                            element_basket.count = 1
                            DataBase.users[i].basket.push(element_basket)
                            break
                        }
                    }
                    break
                }
            }
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
        for(let i = 0; i < DataBase.users.length; i++){       
            if(DataBase.users[i].ID == ID_product_and_user.id_user){
                socket.emit("reboot_basket", DataBase.users[i].basket)
                break
            }
        }
    })
    socket.on("challenge_db", function(){
        socket.emit("return_db", DataBase)
    })
    socket.on("delete_user", function(id){
        for(let i = 0; i < DataBase.users.length; i++){
            if(id == DataBase.users[i].ID){
                DataBase.users.splice(i, 1)
                break
            }
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })
    socket.on("delete_market", function(id){
        for(let i = 0; i < DataBase.markets.length; i++){
            if(id == DataBase.markets[i].ID){
                DataBase.markets.splice(i, 1)
                break
            }
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })
    socket.on("delete_products", function(id){
        for(let i = 0; i < DataBase.products.length; i++){
            if(id == DataBase.products[i].ID){
                DataBase.products.splice(i, 1)
                break
            }
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })
    socket.on("delite_products_basket", function(sending_object){
        for(let i = 0; i < DataBase.users.length; i++){
            if(DataBase.users[i].ID == sending_object.id_user){
                for(let j = 0; j < DataBase.users[i].basket.length; j++){
                    if(DataBase.users[i].basket[j] == sending_object.id_product){
                        DataBase.users[i].basket.splice(j, 1)
                        break
                    }
                }
            }
        }
        fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
    })




    socket.on("start_backet", function(id_user){
        for(let i = 0; i < DataBase.users.length; i++){       
            if(DataBase.users[i].ID == id_user){
                socket.emit("reboot_basket", DataBase.users[i].basket)
                break
            }
        }
    })
    socket.on("remove_product_basket", function(remove_basket){
        
        for(let i = 0; i < DataBase.users.length; i++){       
            if(DataBase.users[i].ID == remove_basket.id_user){
                if(DataBase.users[i].basket[remove_basket.index_basket].count != 1){
                    DataBase.users[i].basket[remove_basket.index_basket].count--
                }
                else{
                    DataBase.users[i].basket.splice(remove_basket.index_basket, 1)
                }
                fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
                socket.emit("reboot_basket", DataBase.users[i].basket)
                break
            }
        }
    })
    socket.on("add_product_basket", function(remove_basket){
        
        for(let i = 0; i < DataBase.users.length; i++){       
            if(DataBase.users[i].ID == remove_basket.id_user){
                DataBase.users[i].basket[remove_basket.index_basket].count++
                fse.writeFileSync("DataBase.json", JSON.stringify(DataBase, null, 4))
                socket.emit("reboot_basket", DataBase.users[i].basket)
                break
            }
        }
    })
})
