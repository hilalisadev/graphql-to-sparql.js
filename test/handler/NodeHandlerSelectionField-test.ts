import * as DataFactory from "@rdfjs/data-model";
import {Factory} from "sparqlalgebrajs";
import {Converter} from "../../lib/Converter";
import {NodeHandlerSelectionField} from "../../lib/handler/NodeHandlerSelectionField";
import {IConvertContext, IVariablesDictionary, SingularizeState} from "../../lib/IConvertContext";
import {Util} from "../../lib/Util";

// tslint:disable:object-literal-sort-keys

const OperationFactory = new Factory(DataFactory);

describe('NodeHandlerSelectionField', () => {

  let handler: NodeHandlerSelectionField;

  beforeEach(() => {
    const settings = {
      variableDelimiter: '_',
      expressionVariableCounter: 0,
    };
    const util = new Util(settings);
    handler = new NodeHandlerSelectionField(util, settings);
    Converter.registerNodeHandlers(util, settings);
    Converter.registerNodeValueHandlers(util, settings);
  });

  describe('#handle', () => {
    it('should convert a field selection node', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: { theField: 'http://example.org/theField' },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({ kind: 'Field', name: { kind: 'Name', value: 'theField' } }, ctx))
        .toEqual(OperationFactory.createBgp([
          OperationFactory.createPattern(
            subject,
            DataFactory.namedNode('http://example.org/theField'),
            DataFactory.variable('a_theField'),
          ),
        ]));
    });

    it('should convert a field selection node with a selection set', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          theField: 'http://example.org/theField',
          anotherField: 'http://example.org/anotherField',
          andAnotherField: 'http://example.org/andAnotherField',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            { kind: 'Field', name: { kind: 'Name', value: 'anotherField' } },
            { kind: 'Field', name: { kind: 'Name', value: 'andAnotherField' } },
          ],
        },
      }, ctx)).toEqual(OperationFactory.createBgp([
        OperationFactory.createPattern(
          subject,
          DataFactory.namedNode('http://example.org/theField'),
          DataFactory.variable('a_theField'),
        ),
        OperationFactory.createPattern(
          DataFactory.variable('a_theField'),
          DataFactory.namedNode('http://example.org/anotherField'),
          DataFactory.variable('a_theField_anotherField'),
        ),
        OperationFactory.createPattern(
          DataFactory.variable('a_theField'),
          DataFactory.namedNode('http://example.org/andAnotherField'),
          DataFactory.variable('a_theField_andAnotherField'),
        ),
      ]));
    });

    it('should convert a field selection node with arguments', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          theField: 'http://example.org/theField',
          anotherField: 'http://example.org/anotherField',
          andAnotherField: 'http://example.org/andAnotherField',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
        arguments: [
          { kind: 'Argument', name: { kind: 'Name', value: 'anotherField' },
            value: { kind: 'StringValue', value: 'abc' } },
          { kind: 'Argument', name: { kind: 'Name', value: 'andAnotherField' },
            value: { kind: 'StringValue', value: 'def' } },
        ],
      }, ctx)).toEqual(OperationFactory.createBgp([
        OperationFactory.createPattern(
          subject,
          DataFactory.namedNode('http://example.org/theField'),
          DataFactory.variable('a_theField'),
        ),
        OperationFactory.createPattern(
          DataFactory.variable('a_theField'),
          DataFactory.namedNode('http://example.org/anotherField'),
          DataFactory.literal('abc'),
        ),
        OperationFactory.createPattern(
          DataFactory.variable('a_theField'),
          DataFactory.namedNode('http://example.org/andAnotherField'),
          DataFactory.literal('def'),
        ),
      ]));
    });

    it('should terminate a field selection node without selection set', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: { theField: 'http://example.org/theField' },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      handler.handle({ kind: 'Field', name: { kind: 'Name', value: 'theField' } }, ctx);
      return expect(ctx.terminalVariables).toEqual([
        DataFactory.variable('a_theField'),
      ]);
    });

    it('should terminate a field selection node with an empty selection set', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: { theField: 'http://example.org/theField' },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
        selectionSet: { kind: 'SelectionSet', selections: [] },
      }, ctx);
      return expect(ctx.terminalVariables).toEqual([
        DataFactory.variable('a_theField'),
      ]);
    });

    it('should not terminate a field selection node with selection set', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: { theField: 'http://example.org/theField' },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            { kind: 'Field', name: { kind: 'Name', value: 'anotherField' } },
          ],
        },
      }, ctx);
      return expect(ctx.terminalVariables).toEqual([
        DataFactory.variable('a_theField_anotherField'),
      ]);
    });

    it('should convert a field selection node with an alias', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          theField: 'http://example.org/theField',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        alias: { kind: 'Name', value: 'theAliasField' },
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
      }, ctx)).toEqual(OperationFactory.createBgp([
        OperationFactory.createPattern(
          subject,
          DataFactory.namedNode('http://example.org/theField'),
          DataFactory.variable('a_theAliasField'),
        ),
      ]));
    });

    it('should convert a field selection node with a directive', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          theField: 'http://example.org/theField',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: <IVariablesDictionary> {
          varTrue: { kind: 'BooleanValue', value: true },
          varFalse: { kind: 'BooleanValue', value: false },
        },
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        alias: { kind: 'Name', value: 'theAliasField' },
        kind: 'Field',
        name: { kind: 'Name', value: 'theField' },
        directives: [
          { kind: 'Directive', name: { kind: 'Name', value: 'include' }, arguments: [
            {
              kind: 'Argument',
              name: { kind: 'Name', value: 'if' },
              value: { kind: 'Variable', name: { kind: 'Name', value: 'varTrue' } },
            },
          ] },
        ],
      }, ctx)).toEqual(OperationFactory.createBgp([
        OperationFactory.createPattern(
          subject,
          DataFactory.namedNode('http://example.org/theField'),
          DataFactory.variable('a_theAliasField'),
        ),
      ]));
    });

    it('should convert the __typename meta field', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          theField: 'http://example.org/theField',
          Character: 'http://example.org/types/Character',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: '__typename' },
      }, ctx)).toEqual(
        OperationFactory.createBgp([
          OperationFactory.createPattern(
            subject,
            DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            DataFactory.variable('a___typename'),
          ),
        ]));
    });

    it('should convert a field with one alt argument', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          field1: 'http://example.org/field1',
          field2: 'http://example.org/field2',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'field1' },
        arguments: [
          { kind: 'Argument', name: { kind: 'Name', value: 'alt' },
            value: { kind: 'EnumValue', value: 'field2' } },
        ],
      }, ctx)).toEqual(
        OperationFactory.createPath(
          subject,
          OperationFactory.createAlt(
            OperationFactory.createLink(DataFactory.namedNode('http://example.org/field1')),
            OperationFactory.createLink(DataFactory.namedNode('http://example.org/field2')),
          ),
          DataFactory.variable('a_field1'),
        ));
    });

    it('should convert a field with multiple alt arguments', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          field1: 'http://example.org/field1',
          field2: 'http://example.org/field2',
          field3: 'http://example.org/field3',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'field1' },
        arguments: [
          { kind: 'Argument', name: { kind: 'Name', value: 'alt' },
            value: { kind: 'ListValue', values: [
                { kind: 'EnumValue', value: 'field2' },
                { kind: 'EnumValue', value: 'field3' },
            ] } },
        ],
      }, ctx)).toEqual(
        OperationFactory.createPath(
          subject,
          OperationFactory.createAlt(
            OperationFactory.createAlt(
              OperationFactory.createLink(DataFactory.namedNode('http://example.org/field1')),
              OperationFactory.createLink(DataFactory.namedNode('http://example.org/field2')),
            ),
            OperationFactory.createLink(DataFactory.namedNode('http://example.org/field3')),
          ),
          DataFactory.variable('a_field1'),
        ));
    });

    it('should error on an alt argument of invalid kind', async () => {
      const subject = DataFactory.namedNode('theSubject');
      const ctx: IConvertContext = {
        context: {
          field1: 'http://example.org/field1',
          field2: 'http://example.org/field2',
        },
        graph: DataFactory.defaultGraph(),
        path: [ 'a' ],
        subject,
        singularizeState: SingularizeState.PLURAL,
        singularizeVariables: {},
        terminalVariables: [],
        fragmentDefinitions: {},
        variablesDict: {},
        variablesMetaDict: {},
      };
      return expect(() => handler.handle({
        kind: 'Field',
        name: { kind: 'Name', value: 'field1' },
        arguments: [
          { kind: 'Argument', name: { kind: 'Name', value: 'alt' },
            value: { kind: 'StringValue', value: 'field2' } },
        ],
      }, ctx)).toThrow(new Error('Invalid value type for \'alt\' argument, must be EnumValue, but got StringValue'));
    });
  });

});
