import * as Lint from 'tslint'
import * as path from 'path'
import {EOL} from 'os'
import * as fs from 'fs';

import {consoleTestResultHandler} from "tslint/lib/test";


export function crawl({projectDir = './', out = ''} = {}): string {

    let tsConfigPath = path.join(projectDir, 'tsconfig.json');

    const options = {
        fix: false,
        rulesDirectory: path.join(__dirname, 'rules'),
        formattersDirectory: path.join(__dirname, 'formatters'),
        formatter: 'lwc-result',
        allowJS: true
    }
    const program = Lint.Linter.createProgram(tsConfigPath, projectDir)
    const linter = new Lint.Linter(options, program)
    const rules = new Map<string, Partial<Lint.IOptions>>([
        [
            'lwc-extract',
            {
                ruleName: 'lwc-extract',
            },
        ],
    ])
    const lintConfiguration = {
        rules,
        jsRules: rules,
        rulesDirectory: [options.rulesDirectory],
        formattersDirectory: [options.formattersDirectory],
        formatter: 'lwc-result',
        extends: [''],
    }

    const files = Lint.Linter.getFileNames(program)

    files.forEach(file => {
        const fileContents = program.getSourceFile(file).getFullText()
        linter.lint(file, fileContents, lintConfiguration)
    })

    const result = linter.getResult().output;


    if (out) {
        fs.writeFileSync(path.resolve(out), result);
    } else {
        console.log(result);
    }

    return result;

}
