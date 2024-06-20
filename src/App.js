import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Alert,
  AppBar,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Card as MuiCard,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  styled,
  Toolbar,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const StyledCard = styled(MuiCard)({
  margin: "8px", // Uniform margin for visual spacing
  padding: "8px", // Padding inside the card
  borderRadius: "25px",
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0px",
  "&:last-child": {
    paddingBottom: "0px", // Specifically targeting the last-child pseudo-class to remove padding
  },
}));

const FeatureNameContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  marginRight: "16px", // Space between name/info and the chip
});

const FeatureDetails = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  marginRight: "8px", // Ensuring info button is directly next to the name
}));

const StyledAppBar = styled(AppBar)({
  background: "white", // or any color that fits your design
  color: "black", // adjust text color to match
  boxShadow: "none", // optional: remove shadow for a flatter design
  padding: "10px 0", // add some vertical padding
});

const featureMappings = require("./featureMapping.json");
const sectionMappings = require("./sectionMapping.json");
const releases = {
  release1: require("./releases/release1.json"),
  release2: require("./releases/release2.json"),
  release3: require("./releases/release3.json"),
  release4: require("./releases/release4.json"),
  release5: require("./releases/release5.json"),
  release6: require("./releases/release6.json"),
  release7: require("./releases/release7.json"),
  // More releases
};

const releaseColors = [
  "default",
  "default", // "secondary",
  "default", // "success",
  "default", // "primary",
  "warning",
  "info",
  "error",
];

const releaseAliases = {
  release1: "Early Access",
  release2: "Mid May", // Specify each according to your naming scheme
  release3: "Late May",
  release4: "Mid June",
  release5: "Late June",
  release6: "July 30 (GA)",
  release7: "Post-GA",
};

const releaseDates = {
  release1: "May 2, 2024",
  release2: "mid May, 2024",
  release3: "late May, 2024",
  release4: "mid June, 2024",
  release5: "late June, 2024",
  release6: "July 30, 2024",
  release7: "> August, 2024",
};

const App = () => {
  const [selectedRelease, setSelectedRelease] = useState("release4");
  const [featureList, setFeatureList] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({});
  const [earliestMigrationRelease, setEarliestMigrationRelease] = useState(4);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    loadFeatures("release4");
  }, []);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 1000); // Duration of your animation
    return () => clearTimeout(timer);
  }, [earliestMigrationRelease]);

  const handleReleaseChange = (releaseKey) => {
    setSelectedRelease(releaseKey);
    resetFeaturesToRelease(releaseKey);
  };

  const resetFeaturesToRelease = (releaseKey) => {
    const releaseData = flattenObject(releases[releaseKey].config);
    const updatedFeatures = { ...featureList };
    Object.keys(updatedFeatures).forEach((parent) => {
      updatedFeatures[parent] = updatedFeatures[parent].map((feature) => ({
        ...feature,
        enabled: !!releaseData[feature.key],
      }));
    });
    setFeatureList(updatedFeatures);
    setEarliestMigrationRelease(
      parseInt(releaseKey.replace("release", ""), 10)
    ); // Assuming release keys are like 'release1', 'release2', etc.
  };

  // Ensure handleFeatureChange toggles checkbox states
  const handleFeatureChange = (key, parent) => {
    const updatedFeatures = { ...featureList };
    updatedFeatures[parent] = updatedFeatures[parent].map((feature) => {
      if (feature.key === key) {
        return { ...feature, enabled: !feature.enabled };
      }
      return feature;
    });
    //console.log(updatedFeatures);
    setFeatureList(updatedFeatures);
    //console.log("Updating release based on new feature settings");
    updateEarliestMigrationRelease(updatedFeatures);
  };

  const updateEarliestMigrationRelease = (features) => {
    let maxRelease = 1; // Start with the lowest possible release that has features
    Object.values(features)
      .flat()
      .forEach((feature) => {
        if (feature.enabled) {
          // Check if this feature's release is higher than the current maxRelease
          if (feature.earliestRelease > maxRelease) {
            maxRelease = feature.earliestRelease;
          }
        }
      });

    // Only update if the new maxRelease is different from the current selected release
    if (`release${maxRelease}` !== selectedRelease) {
      setSelectedRelease(`release${maxRelease}`);
      setEarliestMigrationRelease(maxRelease);
    }
  };

  const loadFeatures = (releaseKey) => {
    console.log(`Loading features for ${releaseKey}`);
    const releaseData = flattenObject(releases[releaseKey].config);
    const sections = [
      "appearance",
      "booking",
      "event",
      "expire_after",
      "features",
      "reminders",
    ];
    const features = sections.reduce((acc, section) => {
      acc[section] = []; // Initialize each section with an empty array
      return acc;
    }, {});

    Object.keys(releaseData).forEach((key) => {
      const parent = key.split(".")[0];
      if (sections.includes(parent)) {
        features[parent].push({
          key,
          name: featureMappings[key] ? featureMappings[key].name : key,
          description: featureMappings[key]
            ? featureMappings[key].description
            : "No description available.",
          enabled: !!releaseData[key],
          available: !!releaseData[key],
          earliestRelease: findEarliestRelease(key),
        });
      } else {
        // If the feature doesn't match any defined sections, add it to 'Other'
        if (!features.other) features.other = [];
        features.other.push({
          key,
          name: featureMappings[key] ? featureMappings[key].name : key,
          description: featureMappings[key]
            ? featureMappings[key].description
            : "No description available.",
          enabled: !!releaseData[key],
          available: !!releaseData[key],
          earliestRelease: findEarliestRelease(key),
        });
      }
    });

    setFeatureList(features);
  };

  const handleOpenDialog = (name, description) => {
    setDialogContent({ title: name, description });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Helper function to flatten a nested object
  function flattenObject(ob) {
    let toReturn = {};
    for (let i in ob) {
      if (!ob.hasOwnProperty(i)) continue;
      if (typeof ob[i] === "object" && ob[i] !== null) {
        let flatObject = flattenObject(ob[i]);
        for (let x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          toReturn[i + "." + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }

  // Find the earliest release where a feature appears
  function findEarliestRelease(featureKey) {
    for (let i = 1; i <= Object.keys(releases).length; i++) {
      const releaseConfig = flattenObject(releases["release" + i].config);
      if (releaseConfig[featureKey]) {
        return i;
      }
    }
    return null;
  }
  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={2}>
      <StyledAppBar position="sticky" top={0}>
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1}>
            {Object.keys(releases).map((releaseKey, index) => (
              <Chip
                key={releaseKey}
                label={releaseAliases[releaseKey].toUpperCase()}
                onClick={() => handleReleaseChange(releaseKey)}
                color={releaseColors[index % releaseColors.length]}
                variant={selectedRelease === releaseKey ? "filled" : "outlined"}
                disabled={
                  releaseColors[index % releaseColors.length] == "default"
                }
              />
            ))}
          </Stack>
          <Typography
            style={{
              animation: animate ? "flash 0.8s" : "none",
            }}
          >
            {earliestMigrationRelease
              ? `Your projected migration date is ${
                  releaseDates["release" + earliestMigrationRelease]
                }`
              : "Select features to see migration release"}
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Typography variant="h4" component="h1" gutterBottom>
        Scheduler v3 Interactive Roadmap
      </Typography>
      <Alert severity="warning" style={{ width: "50%" }}>
        Scheduler v3 is under active development, and this roadmap is subject to
        change. <br />
        Last updated:{" "}
        <Typography component="span" color="primary">
          June 20, 2024
        </Typography>
      </Alert>
      <Typography
        width={"50%"}
        align="left"
        variant="body1"
        paddingTop={"20px"}
      >
        If you're a current Nylas v2 Scheduler user, this page helps you
        understand when v3 Scheduler will have the features you need to complete
        migration. <br />
        <br />
        Select all the features your implementation uses to see a projected date
        when Scheduler v3 will include all of your selections. Greyed out items
        are already available.
        <br />
        <br />
        You can also click a release at the top of the page to see which
        features will be available by that release. Scheduler v3 will get closer
        to full feature parity as we build throughout the spring and summer.{" "}
        <br />
        <br />
        Keep in mind that Scheduler v3 might already have everything your
        project needs. If it doesn't you can still{" "}
        <Typography fontStyle={"italic"} display="inline">
          start
        </Typography>{" "}
        migration at any time before the full parity date. This tool is to
        confirm the date when{" "}
        <Typography fontStyle={"italic"} display="inline">
          all
        </Typography>{" "}
        of the features you need will be available.
        <br />
      </Typography>
      {/* this will be for info etc.*/}
      {Object.entries(featureList)
        .sort(([a], [b]) => a.localeCompare(b)) // Sorting sections alphabetically
        .map(([parent, features]) => (
          <Box key={parent} width="50%" paddingTop="20px">
            <Typography variant="h5" gutterBottom component="div">
              {sectionMappings[parent]["name"]}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              component="div"
              color={"grey"}
            >
              {sectionMappings[parent]["description"]}
            </Typography>
            <Stack spacing={1} width="100%">
              {features
                .sort((a, b) => a.earliestRelease - b.earliestRelease) // Sorting features by release within each section
                .map(
                  ({
                    key,
                    name,
                    enabled,
                    available,
                    description,
                    earliestRelease,
                  }) => (
                    <StyledCard key={key} variant="outlined">
                      <StyledCardContent>
                        <FeatureNameContainer>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={enabled}
                                disabled={available}
                                onChange={() =>
                                  handleFeatureChange(key, parent)
                                }
                                // Consider enabling/disabling based on 'available'
                              />
                            }
                            label="" // No label here, name is displayed below
                          />
                          <FeatureDetails>{name}</FeatureDetails>
                          {description && (
                            <IconButton
                              onClick={() =>
                                handleOpenDialog(name, description)
                              }
                              size="small"
                            >
                              <InfoIcon />
                            </IconButton>
                          )}
                        </FeatureNameContainer>
                        <Chip
                          label={
                            releaseAliases[`release${earliestRelease}`] ||
                            `Release ${earliestRelease}`
                          }
                          size="small"
                          color={
                            releaseColors[earliestRelease - 1] || "default"
                          } // Handling case where there's no specific color
                        />
                      </StyledCardContent>
                    </StyledCard>
                  )
                )}
            </Stack>
          </Box>
        ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <Typography>{dialogContent.description}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default App;
