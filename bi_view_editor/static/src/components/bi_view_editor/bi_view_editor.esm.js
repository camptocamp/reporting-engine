/** @odoo-module **/

/* Copyright 2015-2019 Onestein (<https://www.onestein.eu>)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Component, onWillUpdateProps, useState} from "@odoo/owl";
import {FIELD_DATA_TYPE, ModelList} from "./model_list.esm";
import {FieldList} from "./field_list.esm";
import {JoinNodeDialog} from "./join_node_dialog.esm";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {useService} from "@web/core/utils/hooks";

export class BiViewEditor extends Component {
    setup() {
        this.state = useState({
            models: [],
        });
        this.orm = useService("orm");
        this.dialogService = useService("dialog");
        onWillUpdateProps((nextProps) => {
            this.updateFieldList(nextProps.value);
        });
        this.field_list = null;
    }
    updateFieldList(value) {
        if (value) {
            this.field_list.set(JSON.parse(value));
        }
        this.updateModels();
    }
    updateModels() {
        const model_ids = this.field_list.modelIDs;
        this.orm
            .call("ir.model", "get_models", model_ids ? [model_ids] : [])
            .then((models) => {
                this.state.models = models;
            });
    }
    registerFieldList(fieldList) {
        this.field_list = fieldList;
        this.updateFieldList(this.props.value);
    }
    clear() {
        if (this.props.readonly) {
            return;
        }
        this.field_list.set([]);
        this.updateValue();
    }
    fieldUpdated() {
        this.updateValue();
    }
    fieldDeleted() {
        this.orm
            .call("bve.view", "get_clean_list", [this.field_list.get()])
            .then((result) => {
                this.updateFieldList(result);
                this.updateValue();
            });
    }
    getTableAlias(field) {
        if (typeof field.table_alias === "undefined") {
            const model_ids = this.field_list.modelIDs;
            let n = 1;
            while (typeof model_ids["t" + n] !== "undefined") {
                n++;
            }
            return "t" + n;
        }
        return field.table_alias;
    }
    addFieldAndJoinNode(field, join_node) {
        if (join_node.join_node === -1 || join_node.table_alias === -1) {
            field.table_alias = this.getTableAlias(field);
            if (join_node.join_node === -1) {
                join_node.join_node = field.table_alias;
            } else {
                join_node.table_alias = field.table_alias;
            }
            this.field_list.add(join_node);
        } else {
            field.table_alias = join_node.table_alias;
        }

        this.field_list.add(field);
        this.updateValue();
    }
    addField(field) {
        const data = _.extend({}, field);
        const field_data = this.field_list.get();
        this.orm
            .call("ir.model", "get_join_nodes", [field_data, data])
            .then((result) => {
                if (result.length === 1) {
                    this.addFieldAndJoinNode(data, result[0]);
                } else if (result.length > 1) {
                    this.dialogService.add(JoinNodeDialog, {
                        choices: result,
                        model_data: this.field_list.modelData,
                        choiceSelected: (choice) => {
                            this.addFieldAndJoinNode(data, choice);
                        },
                    });
                } else {
                    data.table_alias = this.getTableAlias(data);
                    this.field_list.add(data);
                    this.updateValue();
                }
            });
    }
    fieldClicked(field) {
        this.addField(field);
    }
    onDragOver(e) {
        if (this.props.readonly) {
            return;
        }
        const dragType = e.dataTransfer.types[0];
        if (dragType === FIELD_DATA_TYPE) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
    }
    onDrop(e) {
        if (this.props.readonly) {
            return;
        }
        const dragData = e.dataTransfer.getData(FIELD_DATA_TYPE);
        if (dragData) {
            e.preventDefault();
            this.addField(JSON.parse(dragData));
        }
    }
    updateValue() {
        this.props.update(JSON.stringify(this.field_list.get()));
        this.updateModels();
    }
}
BiViewEditor.template = "bi_view_editor.Frame";
BiViewEditor.components = {
    ModelList,
    FieldList,
};
BiViewEditor.props = {
    ...standardFieldProps,
};

registry.category("fields").add("BVEEditor", BiViewEditor);
