// 模态窗口和名单管理功能

const settingsBtn = document.getElementById("settingsBtn");
const modal = document.getElementById("settingsModal");
const closeBtn = document.getElementsByClassName("close")[0];
const saveBtn = document.getElementById("saveBtn");
const nameInput = document.getElementById("nameInput");
const listSelector = document.getElementById("listSelector");
const addListConfigBtn = document.getElementById("addListConfigBtn");
const actionDialog = document.getElementById("actionDialog");
const actionDialogForm = document.getElementById("actionDialogForm");
const actionDialogTitle = document.getElementById("actionDialogTitle");
const actionDialogMessage = document.getElementById("actionDialogMessage");
const actionDialogInputGroup = document.getElementById("actionDialogInputGroup");
const actionDialogInputLabel = document.getElementById("actionDialogInputLabel");
const actionDialogInput = document.getElementById("actionDialogInput");
const actionDialogError = document.getElementById("actionDialogError");
const actionDialogCancelBtn = document.getElementById("actionDialogCancelBtn");
const actionDialogConfirmBtn = document.getElementById("actionDialogConfirmBtn");
const actionDialogCloseBtn = document.getElementById("actionDialogCloseBtn");
const settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
const settingsSidebar = document.querySelector(".settings-sidebar");
const settingsMenu = document.getElementById("settingsMenu");
const settingsMenuToggle = document.getElementById("settingsMenuToggle");
const settingsMenuCurrent = document.getElementById("settingsMenuCurrent");
const themeOptionButtons = Array.from(document.querySelectorAll("[data-theme-option]"));
const listCount = document.getElementById("listCount");
const listSaveState = document.getElementById("listSaveState");
const appToast = document.getElementById("appToast");
const appToastMessage = document.getElementById("appToastMessage");
const mobileSettingsQuery = window.matchMedia("(max-width: 640px)");

let actionDialogResolve = null;
let actionDialogExpectsInput = false;
let actionDialogValidate = null;
let actionDialogCloseTimer = null;
let actionDialogPendingResult = false;
let toastHideTimer = null;
let toastCloseTimer = null;

function hideToast() {
    if (appToast.hidden || appToast.classList.contains("is-hiding")) {
        return;
    }

    clearTimeout(toastHideTimer);
    appToast.classList.remove("is-visible");
    appToast.classList.add("is-hiding");
    toastCloseTimer = setTimeout(() => {
        appToast.hidden = true;
        appToast.classList.remove("is-hiding");
    }, 160);
}

function showToast(message, variant = "success") {
    clearTimeout(toastHideTimer);
    clearTimeout(toastCloseTimer);
    appToastMessage.textContent = message;
    appToast.dataset.variant = variant;
    appToast.hidden = false;
    appToast.classList.remove("is-hiding", "is-visible");

    requestAnimationFrame(() => {
        appToast.classList.add("is-visible");
    });

    toastHideTimer = setTimeout(hideToast, 2400);
}

function finalizeActionDialogClose() {
    clearTimeout(actionDialogCloseTimer);
    actionDialogCloseTimer = null;

    const resolve = actionDialogResolve;
    const result = actionDialogPendingResult;
    actionDialogResolve = null;
    actionDialogValidate = null;
    actionDialogPendingResult = false;

    if (actionDialog.open) {
        actionDialog.close();
    }
    actionDialog.classList.remove("is-closing");

    if (resolve) {
        resolve(result);
    }
}

function finishActionDialog(result) {
    if (!actionDialog.open || actionDialog.classList.contains("is-closing")) {
        return;
    }

    actionDialogPendingResult = result;
    actionDialog.classList.add("is-closing");
    actionDialogCloseTimer = setTimeout(finalizeActionDialogClose, 180);
}

function showActionDialog({
    title,
    message,
    variant = "info",
    confirmText = "确认",
    cancelText = "取消",
    showCancel = true,
    input = null,
    validate = null
}) {
    actionDialog.dataset.variant = variant;
    actionDialogTitle.textContent = title;
    actionDialogMessage.textContent = message;
    actionDialogConfirmBtn.textContent = confirmText;
    actionDialogCancelBtn.textContent = cancelText;
    actionDialogCancelBtn.hidden = !showCancel;
    actionDialogError.textContent = "";

    actionDialogExpectsInput = Boolean(input);
    actionDialogValidate = validate;
    actionDialogInputGroup.hidden = !actionDialogExpectsInput;

    if (input) {
        actionDialogInputLabel.textContent = input.label || "请输入内容";
        actionDialogInput.placeholder = input.placeholder || "";
        actionDialogInput.value = input.value || "";
    }

    return new Promise(resolve => {
        clearTimeout(actionDialogCloseTimer);
        actionDialog.classList.remove("is-closing");
        actionDialogResolve = resolve;
        actionDialog.showModal();
        requestAnimationFrame(() => {
            if (actionDialogExpectsInput) {
                actionDialogInput.focus();
            } else {
                actionDialogConfirmBtn.focus();
            }
        });
    });
}

function showNotice(title, message, variant = "info") {
    if (variant === "success") {
        showToast(message, variant);
        return Promise.resolve(true);
    }

    return showActionDialog({
        title,
        message,
        variant,
        confirmText: "知道了",
        showCancel: false
    });
}

actionDialogForm.addEventListener("submit", event => {
    event.preventDefault();

    if (actionDialogExpectsInput) {
        const value = actionDialogInput.value.trim();
        const validationMessage = actionDialogValidate
            ? actionDialogValidate(value)
            : (value ? "" : "请输入内容。");

        if (validationMessage) {
            actionDialogError.textContent = validationMessage;
            actionDialogInput.focus();
            return;
        }

        finishActionDialog(value);
        return;
    }

    finishActionDialog(true);
});

actionDialogCancelBtn.addEventListener("click", () => finishActionDialog(false));
actionDialogCloseBtn.addEventListener("click", () => finishActionDialog(false));
actionDialog.addEventListener("cancel", event => {
    event.preventDefault();
    finishActionDialog(false);
});
actionDialog.addEventListener("animationend", event => {
    if (event.target === actionDialog && event.animationName === "action-dialog-out") {
        finalizeActionDialogClose();
    }
});
actionDialog.addEventListener("click", event => {
    if (event.target !== actionDialog) {
        return;
    }

    const bounds = actionDialog.getBoundingClientRect();
    const clickedInside = event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!clickedInside) {
        finishActionDialog(false);
    }
});

function applyTheme(theme, persist = true) {
    const selectedTheme = theme === "gray" ? "gray" : "original";
    document.documentElement.dataset.theme = selectedTheme;

    themeOptionButtons.forEach(button => {
        const isSelected = button.dataset.themeOption === selectedTheme;
        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-checked", String(isSelected));
        button.tabIndex = isSelected ? 0 : -1;
    });

    if (persist) {
        writeStorage("luckyDogTheme", selectedTheme);
    }
}

applyTheme(readStorage("luckyDogTheme") === "gray" ? "gray" : "original", false);

themeOptionButtons.forEach((button, index) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeOption));
    button.addEventListener("keydown", event => {
        if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
            return;
        }

        event.preventDefault();
        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (index + direction + themeOptionButtons.length) % themeOptionButtons.length;
        applyTheme(themeOptionButtons[nextIndex].dataset.themeOption);
        themeOptionButtons[nextIndex].focus();
    });
});

let settingsCloseTimer = null;
let settingsCloseResolve = null;
let settingsClosePromise = Promise.resolve();

function isMobileSettingsMenu() {
    return mobileSettingsQuery.matches;
}

function updateSettingsMenuCurrent(tabName) {
    const activeTab = settingsTabs.find(tab => tab.dataset.settingsTab === tabName);
    const activeLabel = activeTab?.textContent.trim() || "管理名单";
    settingsMenuCurrent.textContent = activeLabel;
    settingsMenuToggle.setAttribute("aria-label", `设置栏目，当前为${activeLabel}`);
}

function setSettingsMenuExpanded(expanded, restoreFocus = false) {
    const isMobile = isMobileSettingsMenu();
    const shouldExpand = isMobile && expanded;

    if (!shouldExpand && isMobile && settingsMenu.contains(document.activeElement)) {
        settingsMenuToggle.focus();
    } else if (!shouldExpand && restoreFocus && isMobile) {
        settingsMenuToggle.focus();
    } else if (!isMobile && document.activeElement === settingsMenuToggle) {
        const activeTab = settingsTabs.find(tab => tab.classList.contains("is-active"));
        activeTab?.focus();
    }

    settingsMenuToggle.setAttribute("aria-expanded", String(shouldExpand));
    settingsMenuToggle.setAttribute("aria-hidden", String(!isMobile));
    settingsMenuToggle.tabIndex = isMobile ? 0 : -1;
    settingsMenu.classList.toggle("is-open", shouldExpand);

    if (isMobile) {
        settingsMenu.inert = !shouldExpand;
        settingsMenu.setAttribute("aria-hidden", String(!shouldExpand));
    } else {
        settingsMenu.inert = false;
        settingsMenu.removeAttribute("aria-hidden");
    }
}

function openSettingsMenuFromKeyboard(focusLast = false) {
    if (!isMobileSettingsMenu()) {
        return;
    }

    setSettingsMenuExpanded(true);
    const target = focusLast
        ? settingsTabs[settingsTabs.length - 1]
        : settingsTabs.find(tab => tab.classList.contains("is-active"));
    requestAnimationFrame(() => target?.focus());
}

function finalizeSettingsClose() {
    clearTimeout(settingsCloseTimer);
    settingsCloseTimer = null;
    setSettingsMenuExpanded(false);
    modal.classList.remove("is-open", "is-closing");
    modal.setAttribute("aria-hidden", "true");

    if (settingsCloseResolve) {
        settingsCloseResolve();
        settingsCloseResolve = null;
    }
}

function openSettingsModal() {
    if (modal.classList.contains("is-closing")) {
        finalizeSettingsClose();
    }

    setSettingsMenuExpanded(false);
    activateSettingsTab("manage-list");
    nameInput.value = names.join("\n");
    updateListEditorMeta(false);
    modal.setAttribute("aria-hidden", "false");
    modal.classList.remove("is-closing");
    modal.classList.add("is-open");
    requestAnimationFrame(() => closeBtn.focus());
}

function closeSettingsModal() {
    if (modal.classList.contains("is-closing")) {
        return settingsClosePromise;
    }
    if (!modal.classList.contains("is-open")) {
        return Promise.resolve();
    }

    setSettingsMenuExpanded(false);
    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    settingsBtn.focus();
    settingsClosePromise = new Promise(resolve => {
        settingsCloseResolve = resolve;
    });
    settingsCloseTimer = setTimeout(finalizeSettingsClose, 180);
    return settingsClosePromise;
}

function activateSettingsTab(tabName, shouldFocus = false) {
    settingsTabs.forEach(tab => {
        const isActive = tab.dataset.settingsTab === tabName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
        if (isActive && shouldFocus) {
            tab.focus();
        }
    });

    settingsPanels.forEach(panel => {
        const isActive = panel.dataset.settingsPanel === tabName;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
    });

    updateSettingsMenuCurrent(tabName);
}

settingsTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        activateSettingsTab(tab.dataset.settingsTab);
        if (isMobileSettingsMenu()) {
            setSettingsMenuExpanded(false, true);
        }
    });
    tab.addEventListener("keydown", event => {
        let nextIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (index + 1) % settingsTabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (index - 1 + settingsTabs.length) % settingsTabs.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = settingsTabs.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        activateSettingsTab(settingsTabs[nextIndex].dataset.settingsTab, true);
    });
});

settingsMenuToggle.addEventListener("click", () => {
    const isExpanded = settingsMenuToggle.getAttribute("aria-expanded") === "true";
    setSettingsMenuExpanded(!isExpanded);
});

settingsMenuToggle.addEventListener("keydown", event => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
    }

    event.preventDefault();
    openSettingsMenuFromKeyboard(event.key === "ArrowUp");
});

const syncSettingsMenuBreakpoint = () => setSettingsMenuExpanded(false);
if (typeof mobileSettingsQuery.addEventListener === "function") {
    mobileSettingsQuery.addEventListener("change", syncSettingsMenuBreakpoint);
} else {
    mobileSettingsQuery.addListener(syncSettingsMenuBreakpoint);
}
setSettingsMenuExpanded(false);

modal.addEventListener("click", event => {
    if (isMobileSettingsMenu() &&
        settingsMenuToggle.getAttribute("aria-expanded") === "true" &&
        !settingsSidebar.contains(event.target)) {
        setSettingsMenuExpanded(false);
    }

    if (event.target === modal) {
        closeSettingsModal();
    }
});
modal.addEventListener("animationend", event => {
    if (event.target === modal && event.animationName === "settings-backdrop-out") {
        finalizeSettingsClose();
    }
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open") && !actionDialog.open) {
        event.preventDefault();

        if (isMobileSettingsMenu() && settingsMenuToggle.getAttribute("aria-expanded") === "true") {
            setSettingsMenuExpanded(false, true);
            return;
        }

        closeSettingsModal();
    }
});

function createDefaultLists() {
    return { default: ["张三", "李四", "王五"] };
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`无法读取本地存储 "${key}"，将使用临时数据。`, error);
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`无法保存本地存储 "${key}"，本次修改不会持久保留。`, error);
    }
}

function loadLegacyNames() {
    const storedLegacyNames = readStorage("namesList");
    if (!storedLegacyNames) {
        return [];
    }

    try {
        const parsedNames = JSON.parse(storedLegacyNames);
        if (!Array.isArray(parsedNames)) {
            throw new Error("旧版名单数据不是数组");
        }

        return parsedNames
            .filter(name => typeof name === "string")
            .map(name => name.trim())
            .filter(Boolean);
    } catch (error) {
        console.warn("旧版名单数据无法读取，已跳过自动迁移。", error);
        return [];
    }
}

function migrateLegacyNames(lists, useAsDefault) {
    const migrationKey = "luckyDogNamesListMigratedV1";
    if (readStorage(migrationKey) === "1") {
        return lists;
    }

    const legacyNames = loadLegacyNames();
    if (legacyNames.length === 0) {
        return lists;
    }

    const alreadyImported = Object.values(lists).some(listNames =>
        listNames.length === legacyNames.length &&
        listNames.every((name, index) => name === legacyNames[index])
    );

    if (!alreadyImported) {
        if (useAsDefault) {
            lists.default = legacyNames;
        } else {
            const baseListName = "旧版名单";
            let legacyListName = baseListName;
            let suffix = 2;
            while (Object.prototype.hasOwnProperty.call(lists, legacyListName)) {
                legacyListName = `${baseListName} ${suffix}`;
                suffix++;
            }
            lists[legacyListName] = legacyNames;
        }

        writeStorage("lists", JSON.stringify(lists));
    }

    // 保留旧数据键以便降级版本使用，只记录已完成迁移，避免重复导入。
    writeStorage(migrationKey, "1");
    return lists;
}

function loadSavedLists() {
    const storedLists = readStorage("lists");
    if (!storedLists) {
        return migrateLegacyNames(createDefaultLists(), true);
    }

    try {
        const parsedLists = JSON.parse(storedLists);
        if (!parsedLists || typeof parsedLists !== "object" || Array.isArray(parsedLists)) {
            throw new Error("名单数据不是有效对象");
        }

        const validLists = Object.create(null);
        Object.entries(parsedLists).forEach(([listName, listNames]) => {
            if (listName.trim() && Array.isArray(listNames)) {
                validLists[listName] = listNames.filter(name => typeof name === "string");
            }
        });

        if (Object.keys(validLists).length === 0) {
            throw new Error("名单数据中没有有效名单");
        }

        return migrateLegacyNames(validLists, false);
    } catch (error) {
        console.warn("本地名单数据已损坏，将使用默认名单。", error);
        return migrateLegacyNames(createDefaultLists(), true);
    }
}

// 加载保存的名单列表和当前选择的名单
let savedLists = loadSavedLists();
const storedCurrentList = readStorage("currentList");
let currentList = storedCurrentList && Object.prototype.hasOwnProperty.call(savedLists, storedCurrentList)
    ? storedCurrentList
    : (Object.prototype.hasOwnProperty.call(savedLists, "default") ? "default" : Object.keys(savedLists)[0]);
let names = savedLists[currentList];
let usedNameIndexes = [];

function getEditorNames() {
    return nameInput.value.split("\n")
        .map(name => name.trim())
        .filter(Boolean);
}

function updateListEditorMeta(isDirty = false) {
    const count = getEditorNames().length;
    listCount.textContent = `共 ${count} 个名字`;
    listSaveState.textContent = isDirty ? "有未保存的更改" : "更改已保存";
    listSaveState.classList.toggle("is-dirty", isDirty);
}

// 更新下拉菜单并设置默认值
function populateListSelector() {
    listSelector.replaceChildren();
    Object.keys(savedLists).forEach(listName => {
        const option = document.createElement("option");
        option.value = listName;
        option.textContent = listName;
        listSelector.appendChild(option);
    });
    listSelector.value = currentList; // 自动选择当前名单
}
populateListSelector();

// 切换名单
listSelector.addEventListener("change", (event) => {
    currentList = event.target.value;
    writeStorage("currentList", currentList); // 保存当前选择的名单
    names = savedLists[currentList] || [];
    usedNameIndexes = []; // 切换名单时清空已抽取记录
    nameInput.value = names.join("\n");
    updateListEditorMeta(false);
    nameDisplay.textContent = "Ready!";
});

nameInput.addEventListener("input", () => updateListEditorMeta(true));

// 打开模态窗口
settingsBtn.onclick = openSettingsModal;

// 关闭模态窗口
closeBtn.onclick = closeSettingsModal;

// 添加新名单
addListConfigBtn.onclick = async () => {
    const newListName = await showActionDialog({
        title: "新建名单",
        message: "输入新名单名称。",
        variant: "prompt",
        confirmText: "创建",
        input: {
            label: "名单名称",
            placeholder: "例如：一班、活动嘉宾"
        },
        validate: value => {
            if (!value) {
                return "请输入名单名称。";
            }
            if (Object.prototype.hasOwnProperty.call(savedLists, value)) {
                return "该名单名称已经存在，请换一个名称。";
            }
            return "";
        }
    });

    if (typeof newListName !== "string") {
        return;
    }

    savedLists[newListName] = [];
    writeStorage("lists", JSON.stringify(savedLists));
    populateListSelector();
    await showNotice("创建成功", `已创建“${newListName}”`, "success");
};

// 保存当前名单
saveBtn.onclick = async function () {
    const namesList = getEditorNames();

    if (namesList.length === 0) {
        await showNotice("无法保存", "名单不能为空，请输入至少一个名字。", "danger");
        return;
    }

    const confirmed = await showActionDialog({
        title: "保存更改",
        message: `保存“${currentList}”中的 ${namesList.length} 个名字？`,
        confirmText: "保存"
    });
    if (!confirmed) {
        return;
    }

    savedLists[currentList] = namesList;
    writeStorage("lists", JSON.stringify(savedLists));
    names = namesList;
    usedNameIndexes = []; // 保存新名单时清空已抽取记录
    updateListEditorMeta(false);

    await closeSettingsModal();
    await showNotice("保存成功", `已保存“${currentList}” · ${namesList.length} 个名字`, "success");
};

// 随机点名功能
const nameDisplay = document.getElementById("nameDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
let interval = null;
let autoPauseTimeout = null;

// 获取随机名称
function getRandomName() {
    if (names.length === 0) {
        return "名单为空！";
    }
    if (usedNameIndexes.length === names.length) {
        usedNameIndexes = []; // 如果所有名单项都已抽取过，清空已用列表
    }
    const availableIndexes = names
        .map((_, index) => index)
        .filter(index => !usedNameIndexes.includes(index));
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    usedNameIndexes.push(randomIndex); // 按名单位置记录，兼容重名
    return names[randomIndex];
}

// 开始随机点名
async function startRandom() {
    if (names.length === 0) {
        await showNotice("名单为空", "请先打开设置，为当前名单添加至少一个名字。", "danger");
        return;
    }

    startBtn.disabled = true;
    pauseBtn.disabled = false;

    interval = setInterval(() => {
        nameDisplay.textContent = getRandomName();
    }, 50); // 每50ms切换一次名字

    // 随机时间后自动暂停
    const randomPauseTime = Math.random() * 2000 + 1000; // 随机1-3秒
    autoPauseTimeout = setTimeout(() => {
        autoPauseTimeout = null;
        pauseRandom();
    }, randomPauseTime);
}

// 暂停点名
function pauseRandom() {
    clearInterval(interval);
    interval = null;
    if (autoPauseTimeout !== null) {
        clearTimeout(autoPauseTimeout);
        autoPauseTimeout = null;
    }
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
deleteListConfigBtn.onclick = async () => {
    if (Object.keys(savedLists).length === 1) {
        await showNotice("无法删除", "必须至少保留一个名单。", "danger");
        return;
    }

    const currentListName = currentList; // 保存当前名单名称
    const nextList = Object.keys(savedLists).find(list => list !== currentList); // 获取一个剩余名单

    const confirmDelete = await showActionDialog({
        title: "删除名单",
        message: `删除“${currentListName}”？此操作无法撤销。\n删除后将切换到“${nextList}”。`,
        variant: "danger",
        confirmText: "删除"
    });
    if (!confirmDelete) return;

    // 删除当前名单
    delete savedLists[currentList];
    writeStorage("lists", JSON.stringify(savedLists));

    // 切换到剩余的第一个名单
    currentList = nextList;
    writeStorage("currentList", currentList);
    names = savedLists[currentList];
    usedNameIndexes = []; // 重置已抽取记录

    // 更新界面
    populateListSelector();
    nameInput.value = names.join("\n");
    updateListEditorMeta(false);
    nameDisplay.textContent = "Ready!";
    await showNotice("删除成功", `已删除“${currentListName}”，当前为“${currentList}”`, "success");
};
