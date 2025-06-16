const User = require("../models/User");
const UserProfile = require("../models/UserProfile");

exports.analyzeCV = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.cv) {
      return res.status(400).json({ error: "No CV uploaded for this user." });
    }

    // Mock analysis data (in real implementation, this would come from the NLP model)
    const analysisData = {
      skills: ["JavaScript", "Node.js", "React", "MongoDB", "Express.js"],
      experience: "3+ years",
      education: "Bachelor's Degree in Computer Science"
    };

    // Update UserProfile with analysis data
    let userProfile = await UserProfile.findOne({ user: user._id });
    if (!userProfile) {
      userProfile = new UserProfile({
        user: user._id,
        cv: user.cv,
        skills: analysisData.skills,
        education: analysisData.education
      });
    } else {
      userProfile.skills = analysisData.skills;
      userProfile.education = analysisData.education;
    }

    // Update experience information
    const experienceYears = parseInt(analysisData.experience);
    if (experienceYears >= 3) {
      userProfile.experience.push({
        title: "Senior Developer",
        company: "Previous Company",
        from: new Date(Date.now() - (experienceYears * 365 * 24 * 60 * 60 * 1000)),
        to: new Date(),
        current: true,
        description: "Working with modern web technologies"
      });
    }

    await userProfile.save();

    // Return analysis data
    return res.json({
      success: true,
      message: "CV analysis completed",
      data: {
        skills: analysisData.skills,
        experience: analysisData.experience,
        education: analysisData.education
      }
    });
  } catch (error) {
    console.error("CV Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze CV",
      error: error.message
    });
  }
};
