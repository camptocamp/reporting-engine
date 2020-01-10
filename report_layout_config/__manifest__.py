# Copyright 2020 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Report layout configuration",
    "summary": "Add possibility to easely modify the global report layout",
    "version": "13.0.1.0.0",
    "category": "Reporting",
    "website": "http://github.com/OCA/reporting-engine",
    "author": "Camptocamp, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["web", "base"],
    "data": [
        "views/report_templates.xml",
        "views/res_company.xml",
    ],
    "application": False,
    "installable": True,
}
