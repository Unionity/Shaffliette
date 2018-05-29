window.TerminalOptions = {
  user: "root",
  hostname: "dev.android.shaffl",
  dir: "~",
  delay: 100,
  su: true,
  interpreter: "aranea"
};
window.TerminalApps = {
    echo(args, argc, term) {
	term.System().stdout.printLn(args[0]);
    },
    shaffl(args, argc, term) {
        term.System().stdout.printLn(`Shaffl ${Shaffl.v}`);
	if(argc > 0) {
	    switch(args[0]) {
	        case "download":
		    term.System().stdout.printLn("Initializing download...");
		    if(args[1] == "--selected") return term.controller.download();
		    return term.controller.download(false);
		break;
	        default:
		    term.System().stderr.printLn("Unrecognized action!");
	    }
	}
    },
    eridan(args, argc, term) {
	term.System().stderr.printLn("Eridan is not available on your platform yet.");
    },
    aranea(args, argc, term) {
	term.execCommand(args[0], args.splice(1, 128));
    }
}
