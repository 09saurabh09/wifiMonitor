# wifiMonitor
Given TP-Link router it will monitor the data usage of devices via router
Edit create a file config.json in config folder with following structure

{
	"auth" : {
        "user": "Email_id",
        "pass": "Password"
    },
    "db_query":"MONGO_DB_URL",
    "host_address":"Host_email",    
    "recipients": ["@","@"],
    "mac_to_name_mail": {
    	"B0-10-41-16-EA-EF" : ["Pankaj-PC", "bhanu.pankaj7711@gmail.com"],
    	"70-F1-A1-C3-39-79" : ["Rakesh Kumar-PC", "rakeyshkumar13@gmail.com"],
    	"00-24-2C-88-BE-27" : ["Saurabh-XPS", "pk32169@gmail.com"],
    	"4C-25-78-36-7F-AC" : ["Nokia Lumia 920", "09saurabh09@gmail.com"],
    	"90-21-81-72-A4-57" : ["Yu Yunique", "pk32169@gmail.com"],
    	"AC-BC-32-77-92-21" : ["saurabhk-mac", "09saurabh09@gmail.com"]
    }
}
