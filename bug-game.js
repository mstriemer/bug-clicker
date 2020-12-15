class BcGame extends HTMLElement {
  connectedCallback() {
    this.startButton = document.createElement("button");
    this.startButton.textContent = "Start clicking bugs!";
    this.startButton.addEventListener("click", () => {
      this.startButton.remove();
      this.start();
    });
    this.addEventListener("game-over", () => this.gameOver());
    this.append(this.startButton);
  }

  start() {
    this.textContent = "";
    this.scoreElement = new BcScore();
    this.append(new BcSandbox(), this.scoreElement);
  }

  gameOver() {
    this.textContent ="";
    let lossMessage = document.createElement("h2");
    lossMessage.textContent = "Oomph! Better luck next time!";
    let scoreMessage = document.createElement("p");
    scoreMessage.textContent = `You scored ${this.scoreElement.score} points!`;
    this.append(
      lossMessage,
      scoreMessage,
      this.startButton,
    );
  }
}
customElements.define("bc-game", BcGame);

class BcSandbox extends HTMLElement {
  connectedCallback() {
    this.sandbox = document.createElement("div");
    this.sandbox.classList.add("sandbox");
    this.append(this.sandbox);

    this.waitForBugTimer();
    this.bugsCreated = 0;
    this.bugsClicked = 0;

    document.addEventListener("bug-clicked", () => this.bugsClicked++);
  }

  async waitForBugTimer() {
    await this.wait(this.getNextBugTime());

    if (this.bugsCreated - this.bugsClicked >= 10) {
      this.gameOver();
      return;
    }

    this.sandbox.append(new BcBug());
    this.bugsCreated++;
    this.waitForBugTimer();
  }

  getNextBugTime() {
    if (this.bugsCreated < 10) {
      return 1500;
    } else if (this.bugsCreated < 25) {
      return 1000;
    } else if (this.bugsCreated < 50) {
      return 750;
    } else if (this.bugsCreated < 100) {
      return 500;
    } else {
      return 350;
    }
  }

  gameOver() {
    // Don't let the bugs get clicked from now end.
    this.style.pointerEvents = "none";

    this.dispatchEvent(new CustomEvent("game-over", { bubbles: true }));
  }

  wait(n) {
    return new Promise(r => setTimeout(r, n));
  }
}
customElements.define("bc-sandbox", BcSandbox);

class BcBug extends HTMLElement {
  connectedCallback() {
    let createdTime = +new Date();

    this.img = document.createElement("img");
    this.img.src = "bug.png";
    this.append(this.img);

    let sandbox = this.parentElement;
    let { clientWidth, clientHeight } = sandbox;
    this.img.style.top = `${Math.random() * (clientHeight - this.img.clientHeight)}px`;
    this.img.style.left = `${Math.random() * (clientWidth - this.img.clientWidth)}px`;

    this.addEventListener("mousedown", () => {
      this.dispatchEvent(
        new CustomEvent("bug-clicked", {
          bubbles: true,
          detail: { time: (+new Date() - createdTime) },
        })
      );
      this.remove();
    });
  }
}
customElements.define("bc-bug", BcBug);

class BcScore extends HTMLElement {
  connectedCallback() {
    this.score = 0;
    this.label = document.createElement("span");
    this.label.textContent = "Score: ";
    this.scoreText = document.createElement("span");
    this.showScore();
    this.label.append(this.scoreText);
    this.append(this.label);

    document.addEventListener("bug-clicked", this);
  }

  showScore() {
    this.scoreText.textContent = this.score;
  }

  handleEvent(e) {
    if (e.type == "bug-clicked") {
      let { time } = e.detail;
      if (time < 500) {
        this.score += 20;
      } else if (time < 1000) {
        this.score += 10;
      } else {
        this.score += 5;
      }
      this.showScore();
    }
  }
}
customElements.define("bc-score", BcScore);
