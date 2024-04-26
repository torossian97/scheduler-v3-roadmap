import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChairAltSharp, ChildCareSharp } from "@mui/icons-material";

// Custom styled components
const StyledAppBar = styled(AppBar)({
  backgroundColor: "#fff", // Or any other color
  color: "#333",
});

const TimelineConnector = styled(Divider)(({ theme }) => ({
  height: "2px",
  width: "100%",
  backgroundColor: theme.palette.grey[400],
}));

// Component definition
const ReleaseTimeline = ({
  releases,
  releaseAliases,
  releaseColors,
  releaseDates,
  selectedRelease,
  handleReleaseChange,
  animate,
}) => {
  return (
    <StyledAppBar position="sticky" top={0}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {Object.keys(releases).map((releaseKey, index) => (
            <>
              <Chip
                key={releaseKey}
                label={`${releaseAliases[releaseKey].toUpperCase()} - ${
                  releaseDates[releaseKey]
                }`}
                onClick={() => handleReleaseChange(releaseKey)}
                color={releaseColors[index % releaseColors.length]}
                variant={selectedRelease === releaseKey ? "filled" : "outlined"}
              />
              {index < Object.keys(releases).length - 1 && (
                <TimelineConnector orientation="vertical" flexItem />
              )}
            </>
          ))}
        </Stack>
        {/* <Typography
          style={{
            animation: animate ? "flash 0.8s" : "none",
          }}
        >
          {earliestMigrationRelease
            ? `Your projected migration date is ${
                releaseDates["release" + earliestMigrationRelease]
              }`
            : "Select features to see migration release"}
        </Typography> */}
      </Toolbar>
    </StyledAppBar>
  );
};

export default ReleaseTimeline;
