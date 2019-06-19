//自定义localstorage的过期逻辑
function SetLocal(key, val) {
	var curTime = new Date().getTime();
	localStorage.setItem(key, JSON.stringify({ data: val, time: curTime }))
}

function GetLocal(key, exp) {
	// console.log("GetLocal with " + key + "," + exp)
	var data = localStorage.getItem(key);
	if (data == undefined) {
		return undefined
	}
	// console.log("GetLocal get " + data)
	var dataObj = JSON.parse(data);
	if (exp != undefined && new Date().getTime() - dataObj.time > exp) {
		// console.log(key + " 已过期")
		return undefined
	} else {
		// console.log("data=" + dataObj.data)
		return dataObj.data
	}
}

// 更新缓存时间
function UpdateLocalTime(key) {
	var data = localStorage.getItem(key);
	if (data == undefined) {
		return
	}
	// console.log("UpdateLocal time for " + key)
	var dataObj = JSON.parse(data);
	SetLocal(key, dataObj.data);
}

// 移除缓存
function ClearLocal(key) {
	localStorage.removeItem(key)
}

var gDbgLvl = 2 // 0: err, 1: debug, 2: info

function LOG_DEBUG(log) {
	if (gDbgLvl >= 1) {
		console.log(log)
	}
}

function LOG_ERROR(log) {
	if (gDbgLvl >= 0) {
		console.log(log)
	}
}

function LOG_INFO(log) {
	if (gDbgLvl >= 2) {
		console.log(log)
	}
}
