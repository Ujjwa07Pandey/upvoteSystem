import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { Box } from '@material-ui/core';
import firebase from 'firebase';
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',

    justifyContent: 'space-around',
    minWidth: 275,
    borderRadius: 20,
    padding: '0rem 1rem',
    margin: '1.5rem 0rem',
    boxShadow: '0px 0px 10px 1px rgba(204, 204, 204,0.5)',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
}));
const RequestCard = ({ id, item, isLogin = false }) => {
  const classes = useStyles();

  const updateUpvote = (_id) => {
    firebase
      .firestore()
      .collection('requests')
      .doc(_id)
      .update({
        upvotes: firebase.firestore.FieldValue.increment(1),
      });
  };
  const deleteUpvote = (_id) => {
    firebase.firestore().collection('requests').doc(_id).delete();
  };
  return (
    <Card className={classes.root}>
      <CardContent style={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom style={{ color: '#7F7F7F' }}>
          {item.title}
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{ color: '#9E9E9E' }}
        >
          {item.desc}
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'space-between' }}>
        {isLogin && (
          <Button
            variant="outlined"
            style={{
              color: '#DF4040',
              borderColor: '#DF4040',
              textTransform: 'unset',
              fontSize: 20,
              borderRadius: 20,
            }}
            onClick={() => deleteUpvote(id)}
          >
            Delete
          </Button>
        )}

        <Button
          variant="contained"
          color={
            item.status === 'Requested'
              ? 'primary'
              : item.status === 'In Progress'
              ? 'secondary'
              : 'primary'
          }
          style={{ borderRadius: 20, margin: '0rem 4rem' }}
        >
          <Typography variant="body2">{item.status}</Typography>
        </Button>

        <Button variant="outlined" onClick={() => updateUpvote(id)}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '-10px 0px',
            }}
          >
            <ArrowDropUpIcon fontSize={'large'} />

            <Typography
              variant="h6"
              gutterBottom
              style={{ marginTop: -15, fontWeight: 'bold' }}
            >
              {item.upvotes}
            </Typography>
          </Box>
        </Button>
      </CardActions>
    </Card>
  );
};

export default RequestCard;
