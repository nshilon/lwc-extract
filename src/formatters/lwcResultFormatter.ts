import * as ts from "typescript";
import * as Lint from "tslint";
import * as path from "path";

export class Formatter extends Lint.Formatters.AbstractFormatter {
    public format(failures: Lint.RuleFailure[]): string {
        const failuresJSON = failures
            .filter(x => x.getRuleName() === 'lwc-extract')
            .map(x => JSON.parse(x.getFailure()))
            .map(obj => {
                const {name, ext} = path.parse(obj.file);

                return ({...obj, file: `${name}${ext}`});
            });

        return JSON.stringify(failuresJSON);
    }
}

