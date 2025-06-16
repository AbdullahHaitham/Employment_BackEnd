const User = require("../models/User");
const UserProfile = require("../models/UserProfile");

exports.uploadCV = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No CV file uploaded." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Store the CV URL/path in both User and UserProfile documents
    user.cv = req.file.path;
    await user.save();

    // Update or create UserProfile
    let userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      userProfile = new UserProfile({
        user: userId,
        cv: req.file.path
      });
    } else {
      userProfile.cv = req.file.path;
    }
    await userProfile.save();

    return res.status(200).json({
      message: "CV uploaded successfully",
      data: {
        fileId: req.file.id,
        path: req.file.path
      }
    });

   
    const response = await fetch(cvUrl);
    const fileBlob = await response.blob();

    const client = await Client.connect("Abdullah-1A/EMP"); 
    const result = await client.predict("/predict", {
      file: fileBlob,
    });

    const prediction = result.data;

    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: prediction.first_name,
        middleName: prediction.middle_name,
        lastName: prediction.last_name,
        email: prediction.email,
        phone: prediction.phone,
        location: prediction.location,
        major: prediction.major,
        graduationYear: prediction.graduation_year,
        experience: prediction.experience,
        projects: prediction.project_names,
      },
      { new: true }
    );

    res.status(200).json({
      message: "CV uploaded and profile updated",
      cv: cvUrl,
      updatedFields: prediction,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ CV processing error:", error.message);
    res.status(500).json({ message: "Failed to process CV", error: error.message });
  }
};
