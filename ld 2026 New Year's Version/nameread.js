// 模态窗口和名单管理功能

const settingsBtn = document.getElementById("settingsBtn");
const modal = document.getElementById("settingsModal");
const closeBtn = document.getElementsByClassName("close")[0];
const saveBtn = document.getElementById("saveBtn");
const nameInput = document.getElementById("nameInput");
const listSelector = document.getElementById("listSelector");
const addListConfigBtn = document.getElementById("addListConfigBtn");

// 加载保存的名单列表和当前选择的名单
let savedLists = JSON.parse(localStorage.getItem("lists")) || { default: ["张三", "李四", "王五"] };
let currentList = localStorage.getItem("currentList") || "default";
let names = savedLists[currentList] || savedLists.default;
let usedNames = [];

// 更新下拉菜单并设置默认值
function populateListSelector() {
    listSelector.innerHTML = Object.keys(savedLists)
        .map(listName => `<option value="${listName}">${listName}</option>`)
        .join("");
    listSelector.value = currentList; // 自动选择当前名单
}
populateListSelector();

// 切换名单
listSelector.addEventListener("change", (event) => {
    currentList = event.target.value;
    localStorage.setItem("currentList", currentList); // 保存当前选择的名单
    names = savedLists[currentList] || [];
    usedNames = []; // 切换名单时清空已抽取记录
    nameInput.value = names.join("\n");
    nameDisplay.textContent = "Ready!";
});

// 打开模态窗口
settingsBtn.onclick = function () {
    nameInput.value = names.join("\n");
    modal.style.display = "flex";
};

// 关闭模态窗口
closeBtn.onclick = function () {
    modal.style.display = "none";
};

// 添加新名单
addListConfigBtn.onclick = () => {
    const newListName = prompt("请输入新名单配置的名称:");
    if (newListName && !savedLists[newListName]) {
        savedLists[newListName] = [];
        localStorage.setItem("lists", JSON.stringify(savedLists));
        populateListSelector();
        alert(`名单配置 "${newListName}" 已创建！`);
    } else {
        alert("该名单配置已存在或名称无效！");
    }
};

// 保存当前名单
saveBtn.onclick = function () {
    const namesList = nameInput.value.split("\n")
        .map(name => name.trim())
        .filter(name => name !== ""); // 过滤空行

    if (namesList.length === 0) {
        alert("名单不能为空，请输入至少一个名字！");
        return;
    }

    savedLists[currentList] = namesList;
    localStorage.setItem("lists", JSON.stringify(savedLists));
    names = namesList;
    usedNames = []; // 保存新名单时清空已抽取记录

    alert(`名单 "${currentList}" 已保存！`);
    modal.style.display = "none";
};

// 随机点名功能
const nameDisplay = document.getElementById("nameDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
let interval;

// 获取随机名称
function getRandomName() {
    if (names.length === 0) {
        return "名单为空！";
    }
    if (usedNames.length === names.length) {
        usedNames = []; // 如果所有名字都已抽取过，清空已用列表
    }
    const availableNames = names.filter(name => !usedNames.includes(name));
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.push(randomName); // 记录已抽取名字
    return randomName;
}

// 开始随机点名
function startRandom() {
    if (names.length === 0) {
        alert("当前名单为空，请添加名字！");
        return;
    }

    startBtn.disabled = true;
    pauseBtn.disabled = false;

    interval = setInterval(() => {
        nameDisplay.textContent = getRandomName();
    }, 50); // 每50ms切换一次名字

    // 随机时间后自动暂停
    const randomPauseTime = Math.random() * 2000 + 1000; // 随机1-3秒
    setTimeout(() => {
        pauseRandom();
    }, randomPauseTime);
}

// 暂停点名
function pauseRandom() {
    clearInterval(interval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

startBtn.addEventListener("click", startRandom);
pauseBtn.addEventListener("click", pauseRandom);

// 页面加载时自动加载当前名单
window.onload = function () {
    names = savedLists[currentList] || [];
    if (names.length > 0) {
        nameDisplay.textContent = "Ready!";
    } else {
        nameDisplay.textContent = "名单为空！";
    }
};
// 添加删除名单功能按钮
const deleteListConfigBtn = document.getElementById("deleteListConfigBtn");

// 删除名单功能
deleteListConfigBtn.onclick = () => {
    if (Object.keys(savedLists).length === 1) {
        alert("无法删除最后一个名单！");
        return;
    }

    const currentListName = currentList; // 保存当前名单名称
    const nextList = Object.keys(savedLists).find(list => list !== currentList); // 获取一个剩余名单

    const confirmDelete = confirm(`确定要删除当前名单 "${currentListName}" 吗？\n删除后将自动切换到 "${nextList}"。`);
    if (!confirmDelete) return;

    // 删除当前名单
    delete savedLists[currentList];
    localStorage.setItem("lists", JSON.stringify(savedLists));

    // 切换到剩余的第一个名单
    currentList = nextList;
    localStorage.setItem("currentList", currentList);
    names = savedLists[currentList];
    usedNames = []; // 重置已抽取记录

    // 更新界面
    populateListSelector();
    nameInput.value = names.join("\n");
    nameDisplay.textContent = "Ready!";
    alert(`名单 "${currentListName}" 已删除！已切换到名单 "${currentList}"。`);
};
