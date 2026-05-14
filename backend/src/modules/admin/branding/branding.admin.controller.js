const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const { Tenant } = require("../../../models");
const { upload } = require("../../../middlewares");

const router = express.Router();

class BrandingAdminController {
  /**
   * PUT /admin/branding — update theme + business name
   */
  updateBranding = asyncHandler(async (req, res) => {
    const { businessName, theme, logo, banner, favicon, address, location } = req.body;

    const updateData = {};
    if (businessName) updateData.businessName = businessName;
    if (theme)        updateData.theme = theme;
    if (logo)         updateData.logo = logo;
    if (banner)       updateData.banner = banner;
    if (favicon)      updateData.favicon = favicon;
    if (address)      updateData.address = address;
    if (location)     updateData.location = location;

    const tenant = await Tenant.findOneAndUpdate(
      { tenantId: req.tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Tenant not found"));
    }

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenant, "Branding updated"));
  });

  /**
   * POST /admin/branding/logo — upload logo image
   */
  uploadLogo = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "No file uploaded"));
    }
    const logoPath = `/uploads/${req.file.filename}`;
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId: req.tenantId },
      { $set: { logo: logoPath } },
      { new: true }
    );
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { logo: logoPath, tenant }, "Logo uploaded"));
  });

  /**
   * POST /admin/branding/banner — upload banner image
   */
  uploadBanner = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "No file uploaded"));
    }
    const bannerPath = `/uploads/${req.file.filename}`;
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId: req.tenantId },
      { $set: { banner: bannerPath } },
      { new: true }
    );
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { banner: bannerPath, tenant }, "Banner uploaded"));
  });

  /**
   * GET /admin/branding — get current branding
   */
  getBranding = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findOne({ tenantId: req.tenantId })
      .select("businessName theme logo banner favicon address location");
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenant));
  });
}

const controller = new BrandingAdminController();
router.get("/",          controller.getBranding);
router.put("/",          controller.updateBranding);
router.post("/logo",     upload.single("logo"),   controller.uploadLogo);
router.post("/banner",   upload.single("banner"), controller.uploadBanner);

module.exports = { controller, router };
