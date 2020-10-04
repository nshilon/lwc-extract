import * as ts from 'typescript'
import * as Lint from 'tslint'
import {tsquery} from '@phenomnomnominal/tsquery'


class LWCWalker extends Lint.AbstractWalker<Rule> {

    static queryElements = 'ClassDeclaration:has(ExportKeyword, DefaultKeyword, HeritageClause:has(ExpressionWithTypeArguments [name=LightningElement]))'
    static queryImports = 'ImportDeclaration'
    static queryProps = 'PropertyDeclaration:has(Decorator [name=track], Decorator [name=api], Decorator [name=wire])'

    walk(sourceFile: ts.SourceFile): void {

        const result = {
            file: sourceFile.fileName,
            imports: {},
            exportedClass: {}
        }

        const imports = tsquery<ts.ImportDeclaration>(sourceFile, LWCWalker.queryImports);

        imports.forEach(imp => {
            const namedImports = imp.importClause.namedBindings as ts.NamedImports;

            result.imports[imp.moduleSpecifier.getText()] = namedImports ? namedImports.elements?.map(el=> el.getText()) : [imp.importClause.getText()];
        })

        const els = tsquery<ts.ClassDeclaration>(sourceFile, LWCWalker.queryElements, {
            visitAllChildren: true,
        });

        els.forEach(cls => {

            const baseClasses = tsquery<ts.ExpressionWithTypeArguments>(cls, 'HeritageClause > ExpressionWithTypeArguments')

            const props = tsquery<ts.PropertyDeclaration>(cls, LWCWalker.queryProps).map(p => {

                const decs = [...p.decorators]
                    .map(d => d.expression?.getText())
                    .filter(Boolean)
                    .map(d => `@${d}`)
                    .join(' ')

                return `${decs} ${p.name.getText()}`;
            })

            result.exportedClass = result.exportedClass || {};
            result.exportedClass[cls.name.text] = {
                extends: [...baseClasses].map(b=> b.getText()),
                props
            };

        })

        if (Object.keys(result.exportedClass).length > 0 ) {
            this.addFailureAtNode(sourceFile, JSON.stringify(result))
        }
    }


}

export class Rule extends Lint.Rules.AbstractRule {
    static ruleName = 'lwc-extract'

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new LWCWalker(sourceFile, Rule.ruleName, this));
    }

}
