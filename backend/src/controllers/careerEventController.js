// backend/src/controllers/careerEventController.js
const CareerEvent = require("../models/CareerEvent");
const EventRegistration = require("../models/EventRegistration"); // ADD THIS LINE


// Helper: ensure user is a company
const ensureCompany = (req) => {
  if (!req.user || req.user.role !== "company") {
    const err = new Error("Only company accounts can manage career events");
    err.statusCode = 403;
    throw err;
  }
};


// @desc    Create a new career event (company only)
// @route   POST /api/career-events
// @access  Private (company)
exports.createCareerEvent = async (req, res) => {
  try {
    ensureCompany(req);


    const {
      eventName,
      eventSubtitle,
      coverImageUrl, // will come from frontend after upload
      eventWebsite,
      eventType,
      companyName,
      eventDetails,
      eventDeadline,
      eventDate,
      eventPlace,
      activityList,
    } = req.body;


    // Basic validation for required fields
    const missingFields = [];
    if (!eventName) missingFields.push("eventName");
    if (!eventSubtitle) missingFields.push("eventSubtitle");
    if (!coverImageUrl) missingFields.push("coverImageUrl");
    if (!eventWebsite) missingFields.push("eventWebsite");
    if (!eventType) missingFields.push("eventType");
    if (!companyName) missingFields.push("companyName");
    if (!eventDetails) missingFields.push("eventDetails");
    if (!eventDeadline) missingFields.push("eventDeadline");
    if (!eventDate) missingFields.push("eventDate");
    if (!eventPlace) missingFields.push("eventPlace");


    if (
      !activityList ||
      !Array.isArray(activityList) ||
      activityList.length === 0
    ) {
      missingFields.push("activityList (at least one activity)");
    }


    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please provide all required fields",
        missingFields,
      });
    }


    const parsedActivities = activityList.map((a) => ({
      name: a.name,
      time: a.time,
    }));


    // FIX: use id from authenticated user (supports _id or id)
    const companyId = req.user._id || req.user.id;
    if (!companyId) {
      throw new Error("Authenticated company id not found on request user");
    }


    const event = await CareerEvent.create({
      company: companyId,
      companyName,
      eventName,
      eventSubtitle,
      coverImageUrl,
      eventWebsite,
      eventType,
      eventDetails,
      eventDeadline: new Date(eventDeadline),
      eventDate: new Date(eventDate),
      eventPlace,
      activityList: parsedActivities,
    });


    res.status(201).json({
      message: "Career event created successfully",
      event,
    });
  } catch (err) {
    console.error("Error creating career event:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to create career event",
    });
  }
};


// @desc    Get all events for logged-in company
// @route   GET /api/career-events/company
// @access  Private (company)
exports.getCompanyEvents = async (req, res) => {
  try {
    ensureCompany(req);


    const companyId = req.user._id || req.user.id;


    const events = await CareerEvent.find({ company: companyId }).sort({
      createdAt: -1,
    });


    res.json(events);
  } catch (err) {
    console.error("Error fetching company events:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to fetch events",
    });
  }
};


// @desc    Get single event by id (company owns it)
// @route   GET /api/career-events/:id
// @access  Private (company)
exports.getCareerEventById = async (req, res) => {
  try {
    ensureCompany(req);


    const companyId = req.user._id || req.user.id;


    const event = await CareerEvent.findById(req.params.id);


    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }


    if (String(event.company) !== String(companyId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this event" });
    }


    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to fetch event",
    });
  }
};


// @desc    Update an existing career event (company only)
// @route   PUT /api/career-events/:id
// @access  Private (company)
exports.updateCareerEvent = async (req, res) => {
  try {
    ensureCompany(req);


    const companyId = req.user._id || req.user.id;


    const event = await CareerEvent.findById(req.params.id);


    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }


    if (String(event.company) !== String(companyId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }


    const {
      eventName,
      eventSubtitle,
      coverImageUrl,
      eventWebsite,
      eventType,
      companyName,
      eventDetails,
      eventDeadline,
      eventDate,
      eventPlace,
      activityList,
    } = req.body;


    if (eventName !== undefined) event.eventName = eventName;
    if (eventSubtitle !== undefined) event.eventSubtitle = eventSubtitle;
    if (coverImageUrl !== undefined) event.coverImageUrl = coverImageUrl;
    if (eventWebsite !== undefined) event.eventWebsite = eventWebsite;
    if (eventType !== undefined) event.eventType = eventType;
    if (companyName !== undefined) event.companyName = companyName;
    if (eventDetails !== undefined) event.eventDetails = eventDetails;
    if (eventDeadline !== undefined)
      event.eventDeadline = new Date(eventDeadline);
    if (eventDate !== undefined) event.eventDate = new Date(eventDate);
    if (eventPlace !== undefined) event.eventPlace = eventPlace;


    if (activityList !== undefined) {
      if (!Array.isArray(activityList) || activityList.length === 0) {
        return res.status(400).json({
          message: "activityList must contain at least one activity",
        });
      }
      event.activityList = activityList.map((a) => ({
        name: a.name,
        time: a.time,
      }));
    }


    await event.save();


    res.json({
      message: "Career event updated successfully",
      event,
    });
  } catch (err) {
    console.error("Error updating career event:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to update career event",
    });
  }
};


// @desc    Delete a career event (company only)
// @route   DELETE /api/career-events/:id
// @access  Private (company)
exports.deleteCareerEvent = async (req, res) => {
  try {
    ensureCompany(req);


    const companyId = req.user._id || req.user.id;


    const event = await CareerEvent.findById(req.params.id);


    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }


    if (String(event.company) !== String(companyId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }


    // CASCADE DELETE: Remove all registrations for this event
    const deletedRegistrations = await EventRegistration.deleteMany({
      eventId: req.params.id,
    });


    console.log(
      `Deleted ${deletedRegistrations.deletedCount} registrations for event ${req.params.id}`
    );


    await event.deleteOne();


    res.json({
      message: "Career event deleted successfully",
      deletedRegistrations: deletedRegistrations.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting career event:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to delete career event",
    });
  }
};
