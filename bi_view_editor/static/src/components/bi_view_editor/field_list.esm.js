/** @odoo-module **/

/* Copyright 2015-2019 Onestein (<https://www.onestein.eu>)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Component, onMounted, useRef, useState} from "@odoo/owl";

class FieldListItem extends Component {
    // This is only to simplify the template (using field instead of
    // props.field).
    get field() {
        return this.props.field;
    }
    delete() {
        this.props.delete(this.props.field);
    }
    descriptionChanged(e) {
        this.props.setDescription(this.props.field, e.target.value);
    }
}
FieldListItem.template = "bi_view_editor.FieldListItem";
FieldListItem.props = {
    field: Object,
    delete: Function,
    setDescription: Function,
    readonly: Boolean,
};

class JoinListItem extends Component {
    // This is only to simplify the template (using field instead of
    // props.field).
    get field() {
        return this.props.field;
    }
}
JoinListItem.template = "bi_view_editor.JoinListItem";
JoinListItem.props = {
    field: Object,
    readonly: Boolean,
};

class FieldListContextMenu extends Component {
    setup() {
        this.main = useRef("main");
        onMounted(() => {
            $(this.main.el).css({
                left: this.props.position.x + "px",
                top: this.props.position.y + "px",
            });
        });
    }
    close() {
        this.props.close();
    }
    onChange(property, e) {
        this.props.onChange(this.props.field, property, e.target.checked);
    }
}
FieldListContextMenu.props = {
    field: Object,
    position: Object,
    close: Function,
    onChange: Function,
};

class FieldListFieldContextMenu extends FieldListContextMenu {
    get measurable() {
        const type = this.props.field.type;
        return type === "float" || type === "integer" || type === "monetary";
    }
}
FieldListFieldContextMenu.template = "bi_view_editor.FieldList.FieldContextMenu";

class FieldListJoinContextMenu extends FieldListContextMenu {}
FieldListJoinContextMenu.template = "bi_view_editor.FieldList.JoinContextMenu";

export class FieldList extends Component {
    setup() {
        this.state = useState({
            fields: [],
            fieldsByID: {},
            contextMenuOpen: null,
            contextMenuField: null,
            contextMenuPosition: null,
        });
        this.props.register(this);
    }
    get() {
        return this.state.fields;
    }
    get modelIDs() {
        const model_ids = {};
        for (const field of this.state.fields) {
            model_ids[field.table_alias] = field.model_id;
        }
        return model_ids;
    }
    get modelData() {
        const model_data = {};
        for (const field of this.state.fields) {
            model_data[field.table_alias] = {
                model_id: field.model_id,
                model_name: field.model_name,
            };
        }
        return model_data;
    }
    add(field) {
        field.row = typeof field.row === "undefined" ? false : field.row;
        field.column = typeof field.column === "undefined" ? false : field.column;
        field.measure = typeof field.measure === "undefined" ? false : field.measure;
        field.list = typeof field.list === "undefined" ? true : field.list;
        field._id = typeof field._id === "undefined" ? _.uniqueId("node_") : field._id;
        if (field.join_node) {
            field.join_left =
                typeof field.join_left === "undefined" ? false : field.join_left;
        }

        let i = 0;
        const name = field.name;
        while (
            this.state.fields.filter(function (item) {
                return item.name === field.name;
            }).length > 0
        ) {
            field.name = name + "_" + i;
            i++;
        }
        this.state.fields.push(field);
        this.state.fieldsByID[field._id] = field;
    }
    deleteField(field) {
        this.state.fields.splice(
            this.state.fields.findIndex((element) => {
                return element._id === field._id;
            }),
            1
        );
        delete this.state.fieldsByID[field._id];
        this.props.fieldDeleted();
    }
    setFieldProperty(field, property, value) {
        this.state.fieldsByID[field._id][property] = value;
        this.props.fieldUpdated();
    }
    setFieldDescription(field, description) {
        this.setFieldProperty(field, "description", description);
    }
    set(fields) {
        this.state.fields = [];
        this.state.fieldsByID = {};
        for (const field of fields) {
            this.add(field);
        }
        // If this is called while the context menu is open (which is the case
        // when calling this.props.fieldUpdated() in setFieldProperty()),
        // contextMenuField refers to a field that is not in the list anymore
        // (since they where all recreated). The reference must thus be
        // updated.
        if (this.state.contextMenuField !== null) {
            this.state.contextMenuField =
                this.state.fieldsByID[this.state.contextMenuField._id];
        }
    }
    openContextMenu(which, field, e) {
        if (this.props.readonly) {
            return;
        }
        e.preventDefault();
        // Temporarily disable contextmenu for join node (until left join is implemented)
        if (field.join_node) {
            return;
        }
        this.state.contextMenuField = field;
        this.state.contextMenuPosition = {x: e.x - 20, y: e.y - 20};
        this.state.contextMenuOpen = which;
    }
    closeContextMenu() {
        this.state.contextMenuOpen = null;
        this.state.contextMenuField = null;
        this.state.contextMenuPosition = null;
    }
}
FieldList.template = "bi_view_editor.FieldList";
FieldList.components = {
    FieldListItem,
    JoinListItem,
    FieldListFieldContextMenu,
    FieldListJoinContextMenu,
};
FieldList.props = {
    register: Function,
    fieldDeleted: Function,
    fieldUpdated: Function,
    readonly: Boolean,
};
