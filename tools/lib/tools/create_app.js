var fs = require('fs');
var path = require('path');
var globals = require("../core/globals");
var param = require("../core/params_analyze.js");
var file = require('../core/file.js');

function run(dir, args, opts) {
	var app_name = args[0];
	var h5_path = opts["-f"];
	if (!app_name || !h5_path) {
		globals.exit(1601);
	}
    create_app_from(param.getEgretPath(), path.resolve(app_name), path.resolve(h5_path[0]));
}


function create_app_from(egret_path, app_name, h5_path) {
    var app_data = JSON.parse(file.read(path.join(egret_path, "tools/templates/create_app.json")));
    if (!app_data) {
        globals.exit(1602);
    }

    // copy from project template
    globals.log("> copy from project template ...");
    file.copy(path.join(egret_path, app_data.template.source),
        path.join(app_name, app_data.template.target));

    // replace keyword in content
    globals.log("> replace all configure elements ...");
    for (var i = 0; i < app_data.rename_tree.content.length; ++i) {
        var target_path = path.join(app_name, app_data.template.target, app_data.rename_tree.content[i]);
        var content = file.read(target_path);
        content = content.replace(new RegExp(app_data.template_name, "g"), path.basename(app_name));
        file.save(target_path, content);
    }

    // rename keyword in project name
    globals.log("> rename project name ...");
    for (var i = 0; i < app_data.rename_tree.file_name.length; ++i) {
        var str = path.join(app_name, app_data.template.target, app_data.rename_tree.file_name[i]);
        fs.renameSync(str, str.replace(app_data.template_name, path.basename(app_name)))
    }

    // copy h5 res into here
    globals.log("> copy h5 resources into " + app_name + " ...");
    for (var i = 0; i < app_data.game.target.length; ++i) {
        for (var j = 0; j < app_data.game.h5_tree.length; ++j) {
            file.copy(path.join(h5_path, app_data.game.h5_tree[j]),
                path.join(app_name, app_data.template.target, app_data.game.target[i], app_data.game.h5_tree[j]));
        }
    }
}


function help_title() {
    return "从h5游戏生成app";
}


function help_example() {
    return "egret create_app [app_name] -f [h5_game_path]";
}


exports.run = run;
exports.help_title = help_title;
exports.help_example = help_example;