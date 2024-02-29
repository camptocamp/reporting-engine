# Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class IrActionsReport(models.Model):
    _inherit = "ir.actions.report"

    @api.model
    def _build_wkhtmltopdf_args(
        self,
        paperformat_id,
        landscape,
        specific_paperformat_args=None,
        set_viewport_size=False,
    ):
        # OVERRIDE to allow to force the paperformat directly in the specific paperformat args
        if specific_paperformat_args is None:
            specific_paperformat_args = {}
        if "data-report-paperformat" in specific_paperformat_args:
            paperformat_id = self.env.ref(
                specific_paperformat_args.get("data-report-paperformat")
            )
        return super()._build_wkhtmltopdf_args(
            paperformat_id, landscape, specific_paperformat_args, set_viewport_size
        )
