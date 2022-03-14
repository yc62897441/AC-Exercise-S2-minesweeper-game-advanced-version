// timer設置參考 Justin https://lighthouse.alphacamp.co/courses/33/assignments/868/submissions/53912?assignment_id=868&batch_id=45&choice_cohort=all_cohort&course_id=33&from=editor-choice&question_id=1959

// icon 地雷&旗子
const symbols = [
  'icons8-bomb-64.png',  // 地雷
  'icons8-flag-60.png',  // 旗子
]

// 遊戲各階段
const GAME_STATE = {
  gameWaitToStart: "gameWaitToStart",
  gamePlaying: "gamePlaying",
  gameEnd: "gameEnd",
}

// const
const tbody = document.querySelector("#tbody")
const header = document.querySelector("#header")

const view = {
  // 設置格子，並編號data-index
  displayFields(rows, columns) {
    const tbody = document.querySelector("#tbody")
    let innerHTML = ``
    for (let i = 0; i < rows; i++) {
      innerHTML += `<div class="tr">`
      for (let j = 0; j < columns; j++) {
        innerHTML += `<div class="td unrevealed" data-index="${i}-${j}" data-nearbyMines=""></div>`
      }
      innerHTML += `</div>`
    }
    tbody.innerHTML = innerHTML
  },

  // 設置地雷，並設定classList "mine"
  displayMines(mines, rows, columns) {
    const tbody = document.querySelector("#tbody")
    let i = 0
    while (i < mines) {
      // 隨機生成 row 與 column
      let row = Math.floor(Math.random() * rows)
      let column = Math.floor(Math.random() * columns)

      // 確認該 row 與 column 的格子還沒設置地雷，則在該格子設置地雷
      if (!tbody.children[row].children[column].classList.contains("mine")) {
        tbody.children[row].children[column].classList.add("mine")
        i++
      }
    }
  },

  // 計算每個格子，其周遭的地雷數量
  displayMinesAmount(rows, columns) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        let minesAmount = 0
        // 確認該格子沒有設置地雷，則計算該格子附近的地雷數量
        if (!tbody.children[row].children[column].classList.contains("mine")) {
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              try {
                if (tbody.children[row + i].children[column + j].classList.contains("mine")) {
                  minesAmount++
                }
              } catch { }
            }
          }

          // 將該格子附近的地雷數量，儲存至data-nearbyMines
          if (minesAmount !== 0) {
            tbody.children[row].children[column].dataset.nearbyMines = minesAmount
            tbody.children[row].children[column].classList.add(`color${minesAmount}`)
          } else if (minesAmount === 0) {
            tbody.children[row].children[column].dataset.nearbyMines = ""
          }
        }
      }
    }
  },

  // 插旗or移除插旗
  set_remove_flag(event) {
    // 點選格子，可set或remove旗子
    if (event.target.classList.contains("td")) {
      if (event.target.classList.contains("unrevealed")) {
        // 點選格子，set flag
        event.target.classList.remove("unrevealed")
        event.target.classList.add("flag")
        event.target.innerHTML = `<img class="flag" src="${symbols[1]}" alt="">`
        utility.remainMines(-1)
      } else if (event.target.classList.contains("flag")) {
        // 點選格子，remove flag
        event.target.classList.remove("flag")
        event.target.classList.add("unrevealed")
        event.target.innerHTML = ``
        utility.remainMines(1)
      }
    }

    // 已經有插旗的狀況，右鍵旗子可以remove旗子
    if ((event.target.tagName === "IMG") && (event.target.classList.contains("flag"))) {
      event.target.parentElement.classList.remove("flag")
      event.target.parentElement.classList.add("unrevealed")
      event.target.parentElement.innerHTML = ``
      utility.remainMines(1)
    }
  },

  // 地雷爆炸
  mineExplode(event) {
    event.target.classList.add("revealed")
    event.target.classList.add("mineExploded")
    event.target.classList.remove("unrevealed")
    event.target.innerHTML = `<img class="mine" src="${symbols[0]}" alt="">`
    event.target.style.backgroundColor = '#D00000'
    setTimeout(function () {
      window.alert("You lose!")
    }, 100)
  },

  // 顯示所有地雷(踩到地雷，遊戲結束時)
  showAllMines() {
    for (let i = 0; i < model.rows; i++) {
      for (let j = 0; j < model.columns; j++) {
        let brick = tbody.children[i].children[j]
        if ((brick.classList.contains("mine")) && (!brick.classList.contains("mineExploded"))) {
          brick.classList.add("revealed")
          brick.classList.remove("unrevealed")
          brick.innerHTML = `<img class="mine" src="${symbols[0]}" alt="">`
        }
      }
    }
  },

  // 顯示該格子周遭地雷數量
  showFieldContent(event) {
    if (event.target.classList.contains("unrevealed")) {
      event.target.classList.add("revealed")
      event.target.classList.remove("unrevealed")
      event.target.innerHTML = `${event.target.dataset.nearbyMines}`
    }
  },

  // 顯示剩餘地雷數量(顯示在header info中)
  showRemainMines(amount) {
    let minesAmount = document.querySelector(".minesAmount")
    minesAmount.children[1].innerHTML = amount
  },

  // Game Win 遊戲結束
  gameWin() {
    controller.currentState = GAME_STATE.gameEnd
    setTimeout(function () {
      window.alert("You win!")
    }, 100)
  },

  // 顯示遊戲進行時間(單位秒數)
  renderTimer(timer) {
    header.children[1].children[2].children[1].innerHTML = timer
  },
}

const controller = {
  // 當前遊戲階段
  currentState: GAME_STATE.gameWaitToStart,

  /**
   * createGame()
   * 根據參數，顯示遊戲版圖行列
   * 根據參數，埋設地雷
   * 根據地雷埋設位置，計算每個格子周遭的地雷數
   * 顯示剩餘地雷數量於info
   */
  createGame(mines, rows, columns) {
    view.displayFields(rows, columns)
    view.displayMines(mines, rows, columns)
    view.displayMinesAmount(rows, columns)
    view.showRemainMines(mines)
  },

  // 重新一局遊戲
  restartGame() {
    this.currentState = GAME_STATE.gameWaitToStart
    model.reveal = 0
    model.nearByEmptyBrick = []
    this.reSetTimer()
    this.createGame(model.mines, model.rows, model.columns)
  },

  // 接收使用者輸入遊戲參數，並重新一局遊戲
  setGame(event) {
    // 接收參數
    let mines = Math.floor(Number(event.target.parentElement.children[0].children[0].value))
    let rows = Math.floor(Number(event.target.parentElement.children[1].children[0].value))
    let columns = Math.floor(Number(event.target.parentElement.children[2].children[0].value))

    // 確認參數是否合於規格，若否，則請使用者重新輸入
    let reSubmit = false
    if ((mines < 1) || (mines > (rows * columns / 5))) {
      alert("地雷數須大於等於1，並小於等於格子數的1/5")
      reSubmit = true
    }
    if ((rows < 5) || (rows > 15) || (columns < 5) || (columns > 15)) {
      alert("欄與列各別須至少大於等於5，並小於等於15")
      reSubmit = true
    }
    if (reSubmit) {
      return
    }

    // 依參數創造一局遊戲
    model.mines = mines
    model.rows = rows
    model.columns = columns
    event.target.parentElement.children[0].children[0].value = mines
    event.target.parentElement.children[1].children[0].value = rows
    event.target.parentElement.children[2].children[0].value = columns
    this.restartGame()
  },

  // 計時器，開始計時遊戲時間
  setTimer() {
    const endTime = 999
    model.timer = setInterval(() => {
      model.timerStartTime += 1
      view.renderTimer(model.timerStartTime)
      if (model.timerStartTime > endTime) {
        controller.stopTimer()
        return
      }
    }, 1000)

  },

  // 停止計時
  stopTimer() {
    clearInterval(model.timer)
    model.timerStartTime = 0
  },

  // 重新計時
  reSetTimer() {
    clearInterval(model.timer)
    model.timerStartTime = 0
    view.renderTimer(0)
  },
}

const model = {
  // 地雷數、列述、行數、未點開格子數、計時點、遊戲開始時間
  mines: 45,
  rows: 15,
  columns: 15,
  reveal: 0,
  timer: 0,
  timerStartTime: 0,
  nearByEmptyBrick: [],
}

const utility = {
  // 避免第1步就是地雷
  firstClickMine(event) {
    console.log("first click mine, already re-creatGame")
    // 紀錄第1步點選的格子的位置
    let temp_index = event.target.dataset.index
    let row_column = temp_index.split("-")
    let row = Number(row_column[0])
    let column = Number(row_column[1])

    // 重新生成遊戲，直到第1步點選的格子的位置並非是地雷
    while (tbody.children[row].children[column].classList.contains("mine")) {
      controller.createGame(model.mines, model.rows, model.columns)
    }

    // 切換遊戲狀態為"gamePlaying"，並開始計時
    this.gameStart()

    // 顯示第1步點選的格子的內容，並記錄已顯示的格子數+1
    tbody.children[row].children[column].classList.add("revealed")
    tbody.children[row].children[column].classList.remove("unrevealed")
    tbody.children[row].children[column].innerHTML = `${tbody.children[row].children[column].dataset.nearbyMines}`
    model.reveal += 1

    // 如果第1步點選的格子為空白(dataset.nearbyMines === 0)，則顯示附近格子的數字(dataset.nearbyMines)
    if (tbody.children[row].children[column].dataset.nearbyMines === "") {
      let emptyBrickList = []
      emptyBrickList.push(temp_index)
      this.revealEmptyBrick(emptyBrickList)
    }
  },

  // 切換遊戲狀態為"gamePlaying"，並開始計時
  gameStart() {
    if (controller.currentState === "gameWaitToStart") {
      controller.currentState = GAME_STATE.gamePlaying
      controller.setTimer()
    }
  },

  // 顯示周圍空白(dataset.nearbyMines === 0)的格子
  revealEmptyBrick(emptyBrickList) {
    let tempList = emptyBrickList
    model.nearByEmptyBrick = []
    tempList.forEach(item => {
      let row_column = item.split("-")
      let row = Number(row_column[0])
      let column = Number(row_column[1])
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          try {
            if ((tbody.children[row + i].children[column + j].classList.contains("unrevealed")) && (!tbody.children[row + i].children[column + j].classList.contains("flag"))) {
              tbody.children[row + i].children[column + j].classList.add("revealed")
              tbody.children[row + i].children[column + j].classList.remove("unrevealed")
              tbody.children[row + i].children[column + j].innerHTML = `${tbody.children[row + i].children[column + j].dataset.nearbyMines}`
              model.reveal += 1

              if (Number(tbody.children[row + i].children[column + j].dataset.nearbyMines) === 0) {
                model.nearByEmptyBrick.push(String(row + i) + "-" + String(column + j))
              }
            }
          } catch { }
        }
      }
    })
    while (model.nearByEmptyBrick.length > 0) {
      this.revealEmptyBrick(model.nearByEmptyBrick)
    }
  },

  // 計算剩餘地雷數量，並顯示在info
  remainMines(count) {
    let minesAmount = document.querySelector(".minesAmount")
    let amount = Number(minesAmount.children[1].innerHTML) + count
    view.showRemainMines(amount)
  },
}

// 開啟網頁，先設置遊戲
controller.createGame(model.mines, model.rows, model.columns)

// 重新設置遊戲
header.addEventListener("click", function (event) {
  if (event.target.classList.contains("reset")) {
    controller.restartGame()
  } else if (event.target.classList.contains("create")) {
    event.preventDefault()
    controller.setGame(event)
  }
})

// 左鍵點選格子，開始遊戲 
tbody.addEventListener("click", function (event) {
  if (event.target.classList.contains("td")) {
    // 避免地1步就是地雷
    if ((event.target.classList.contains("mine")) && (controller.currentState === "gameWaitToStart")) {
      utility.firstClickMine(event)
      return
    }

    // currentState 切換到 gamePlaying
    utility.gameStart()

    // 左鍵點格子判斷
    if (controller.currentState === "gamePlaying") {
      if ((event.target.classList.contains("mine")) && (!event.target.classList.contains("flag"))) {
        // 點到地雷
        view.mineExplode(event)
        controller.stopTimer()
        view.showAllMines()
        controller.currentState = GAME_STATE.gameEnd
      } else if ((!event.target.classList.contains("mine")) && (!event.target.classList.contains("flag")) && (event.target.classList.contains("unrevealed"))) {
        // 點到未顯示的格子
        view.showFieldContent(event)
        model.reveal += 1

        // 如該格子為空白(dataset.nearbyMines === 0)，則顯示附近格子的數字(dataset.nearbyMines)
        if (event.target.dataset.nearbyMines === "") {
          let emptyBrickList = []
          emptyBrickList.push(event.target.dataset.index)
          utility.revealEmptyBrick(emptyBrickList)
        }

        // 判斷遊戲是否已經達通關條件
        if (model.reveal === (model.rows * model.columns - model.mines)) {
          controller.stopTimer()
          view.showAllMines()
          view.gameWin()
        }
      }
    }
  }
})

// 右鍵 set_remove_flag
tbody.addEventListener('contextmenu', function (event) {
  event.preventDefault()
  if (controller.currentState === "gamePlaying") {
    view.set_remove_flag(event)
  }
})