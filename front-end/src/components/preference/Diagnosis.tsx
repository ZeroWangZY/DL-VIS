import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { useGlobalConfigurations, modifyGlobalConfigurations } from '../../store/global-configuration'
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2)
    },
    content: {
      margin: theme.spacing(1),
      maxHeight: 400,
      flexGrow: 1,
      maxWidth: 400,
      textAlign: 'left',
      overflow: 'auto'
    },
  }),
);

export default function Diagnosis() {
  const classes = useStyles();
  const { diagnosisMode } = useGlobalConfigurations()
  const handleChange = () => {
    modifyGlobalConfigurations(GlobalConfigurationsModificationType.TOGGLE_DIAGNOSIS_MODE)
  };


  return (
    <div className={classes.container}>
      <Typography>
        Diagnosis Mode
      </Typography>
      <div
        className={classes.content}
      >
        <FormControlLabel
          control={<Switch checked={diagnosisMode} onChange={handleChange} />}
          label={"diagnostic mode"}
        />
      </div>
    </div>

  );
}
