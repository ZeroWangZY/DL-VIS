import React, { useState } from "react";
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 32,
      height: 20,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      "&$checked": {
        transform: "translateX(12px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#00A5A7",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#00A5A7",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: 18,
      height: 18,
      boxShadow: "none",
    },
    track: {
      borderRadius: 20 / 2,
      // border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: "#666",
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2),
    },
    content: {
      lineHeight: "64px",
      float: "right",
      color: "white",
    },
  })
);

export default function GraphModeSelection() {
  const classes = useStyles();
  const theme = createMuiTheme({
    typography: {
      fontFamily: [
        "Helvetica Neue",
        "Helvetica",
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei",
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });
  const { conceptualGraphMode, webGLMode, pixiJSMode } = useGlobalConfigurations();
  const handleChangeConceptualGraphMode = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_CONCEPTUALGRAPH_MODE
    );
  };

  const handleChangeWebGLMode = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_WEBGLMODE
    );
  }

  const handleChangePixiJSMode = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_PIXIJSMODE
    );
  }

  return (
    <div className={classes.content}>
      {/* <FormControlLabel
        control={
          <IOSSwitch checked={webGLMode} onChange={handleChangeWebGLMode} />
        }
        label={
          <ThemeProvider theme={theme}>
            <Typography variant="body2">webGL</Typography>
          </ThemeProvider>
        }
      /> */}
      <FormControlLabel
        control={
          <IOSSwitch checked={pixiJSMode} onChange={handleChangePixiJSMode} />
        }
        label={
          <ThemeProvider theme={theme}>
            <Typography variant="body2">PixiJS</Typography>
          </ThemeProvider>
        }
      />

      <FormControlLabel
        control={
          <IOSSwitch checked={conceptualGraphMode} onChange={handleChangeConceptualGraphMode} />
        }
        label={
          <ThemeProvider theme={theme}>
            <Typography variant="body2">概念图模式</Typography>
          </ThemeProvider>
        }
      />
    </div>
  );
}
