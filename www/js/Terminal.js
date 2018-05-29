class Terminal {
  constructor(element, commands, options, controller) {
    this.controller = controller;
    this.element = element;
    this.user = options.user;
    this.hostname = options.hostname;
    this.dir = options.dir;
    this.p = options.su;
    this.commands = commands;
    this.ro = false;
    this.sh = options.interpreter;
    this.delay = options.delay;
    this.aranea_history = [];
    this.history_offset = 0;
    this.init();
  }
  System() {
    let that = this;
    return {
      io: {
        readonly(ro) {
          that.ro = ro;
          that.element.querySelector("#terminal_inputBox").style.display = that.ro ? "none" : "unset";
        },
        blink() {
          that.element.style.filter = "saturate(900%)";
          window.setTimeout(() => {that.element.style.filter = "unset";}, 100);
        }
      },
      stdout: {
        print(str) {
          let el = document.createElement("kbd");
          el.className = "terminal_output";
          el.innerText = str;
          that.element.insertBefore(el, that.element.querySelector("#terminal_inputBox"));
        },
        printLn(str) {
          this.print(str+"\n");
        }
      },
      stderr: {
        print(str) {
          let el = document.createElement("kbd");
          el.className = "terminal_output";
	  el.style = "color: red; font-weight: 600;";
          el.innerText = str;
          that.element.insertBefore(el, that.element.querySelector("#terminal_inputBox"));
        },
        printLn(str) {
          this.print(str+"\n");
        }
      }
    };
  }
  _getTerminalPrefix() {
    return [this.user, this.hostname].join("@") + this.dir + (this.p ? "#" : "$");
  }
  loadHistory() {
    let index = this.aranea_history.length - this.history_offset;
    index--;
    index = (index > this.aranea_history.length || index < 0) ? this.aranea_history.length : index;
   console.log(index); this.element.querySelector("#terminal_input").value = this.aranea_history[index];
   this.history_offset++;
  }
  execCommand(command, args) {
    this.history_offset = 0;
    this.aranea_history.push(command);
    switch(command) {
      case "cd":
        this.System().stdout.printLn("cd .: Permission denied");
      break;
      default:
      if(typeof this.commands[command] == "undefined") {this.System().stdout.printLn(`${this.sh}: ${command}: command not found`); return false;}
      return this.commands[command](args, args.length, this);
    }
  }
  init() {
    this.element.querySelector("#terminal_input").addEventListener("keydown", event => {
      if(event.keyCode === 13) {
        let command = event.target.value.split(" ")[0];
        let args = event.target.value.split(" ").splice(1, 128);
        this.System().stdout.printLn([this._getTerminalPrefix(), event.target.value].join(" "));
        this.execCommand(command, args);
        event.target.value = "";
      } else if(event.keyCode === 38) this.loadHistory();
    });
  }
}
