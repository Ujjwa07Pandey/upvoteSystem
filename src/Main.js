import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Container from '@material-ui/core/Container';
import firebase from 'firebase/app';
import {
  Box,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from '@material-ui/core';

import RequestCard from './components/requestCard';
import Pagination from '@material-ui/lab/Pagination';
const useStyles = makeStyles((theme) => ({
  buttonArea: {
    width: 'max-content',
    display: 'flex',
    flexDirection: 'row',
    margin: '4rem auto',
    justifyContent: 'space-between',
    alignItems: 'center',

    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
    '& > button': {
      borderRadius: 30,
      margin: '1rem 1rem',
      textTransform: 'unset',
      fontSize: 16,
      fontWeight: 600,
    },
  },
}));
const Main = () => {
  const classes = useStyles();
  const [active, setActive] = useState('Requested');
  const [requests, setRequests] = useState(null);
  const [page, setPage] = useState(1);

  const [Docs, setDocs] = useState([]);
  const [user, setuser] = useState(null);

  const googleProvider = new firebase.auth.GoogleAuthProvider();

  const [values, setValues] = useState({
    title: '',
    feature: '',
    status: 'Requested',
  });

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    firebase.firestore().collection('requests').doc().set({
      title: values.title,
      desc: values.feature,
      status: values.status,
      upvotes: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setValues({
      title: '',
      feature: '',
      status: 'Requested',
    });
  };

  const PageChange = (event, value) => {
    setPage(value);
    fetchNextData(value);
  };

  const signInWithGoogle = () => {
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then((res) => {
        console.log('User Signed In With Google');
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const logOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('logged out');
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user !== null) {
        const { displayName, email } = user;
        setuser({
          displayName,
          email,
        });
      }
    });
    async function fetchData() {
      await firebase
        .firestore()
        .collection('requests')
        .onSnapshot((snapshot) => setDocs(snapshot.docs));
    }
    fetchData();
    firebase
      .firestore()
      .collection('requests')
      .where('status', '==', active)
      .orderBy('title')
      .limit(3)
      .onSnapshot((snapshot) => {
        setRequests(
          snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
        );
      });
  }, [active]);

  const fetchNextData = (value) => {
    firebase
      .firestore()
      .collection('requests')
      .where('status', '==', active)
      .orderBy('title')
      .startAfter(Docs[(value - 1) * 3])
      .limit(3)
      .onSnapshot((snapshot) => {
        setRequests(
          snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
        );
      });
  };

  return (
    <Box>
      {/* APPBAR */}

      <AppBar position="static" color="transparent">
        <Toolbar style={{ justifyContent: 'space-around' }}>
          <Typography variant="h4">Upvote</Typography>
          {user === null ? (
            <Button variant="outlined" onClick={signInWithGoogle}>
              Login
            </Button>
          ) : (
            <Button variant="outlined" onClick={logOut}>
              LogOut
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* MAIN AREA */}

      <Container>
        {/* FILTER BUTTONS */}
        <Typography variant="h4" gutterBottom style={{ margin: '1.5rem 0rem' }}>
          Welcome
          <span style={{ color: '#26508B' }}>
            {user !== null ? ' ' + user.displayName + ' ' : ' User '}
          </span>
          !!!
        </Typography>
        <Box className={classes.buttonArea}>
          <Button
            variant={active === 'Requested' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setActive('Requested')}
            disableFocusRipple={true}
          >
            Requested
          </Button>
          <Button
            variant={active === 'Done' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setActive('Done')}
          >
            Done
          </Button>
          <Button
            variant={active === 'In Progress' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setActive('In Progress')}
          >
            In Progress
          </Button>
        </Box>

        {/* FETCH REQUESTS */}

        {requests === null || requests === undefined ? (
          <Box
            style={{
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Loading...
            </Typography>
          </Box>
        ) : (
          <Box my="2rem">
            {Docs.length === 0 ? (
              <Box
                style={{
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  No Requests Found
                </Typography>
              </Box>
            ) : (
              <>
                {requests.map((item) => (
                  <RequestCard
                    key={item.id}
                    item={item.data}
                    id={item.id}
                    isLogin={user !== null ? true : false}
                  />
                ))}
              </>
            )}

            <Box style={{ width: 'max-content' }} mx="auto" my="2.5rem">
              <Pagination
                count={
                  Docs.length % 3 === 0
                    ? Math.floor(Docs.length / 3)
                    : Math.floor(Docs.length / 3) + 1
                }
                size="medium"
                page={page}
                onChange={PageChange}
                variant="outlined"
                color="primary"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          </Box>
        )}

        {/* FORM AREA */}

        <Box justifyContent="center" alignItems="center" my={10}>
          <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
            Propose a New Feature Request
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              id="outlined-basic"
              label="Title"
              fullWidth
              variant="outlined"
              placeholder="Integration with Google Calender"
              required
              value={values.title}
              name="title"
              style={{ margin: '1rem 0rem' }}
              onChange={handleChange}
            />
            <FormControl
              fullWidth
              variant="outlined"
              style={{ margin: '1rem 0rem' }}
            >
              <InputLabel id="demo-simple-select-outlined-label">
                Status
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={values.status}
                onChange={handleChange}
                fullWidth
                label="Status"
                name="status"
              >
                <MenuItem value={'Requested'}>Requested</MenuItem>
                <MenuItem value={'Done'}>Done</MenuItem>
                <MenuItem value={'In Progress'}>In Progress</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="outlined-basic"
              fullWidth
              label="Feature Descrpition (optional)"
              placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
              variant="outlined"
              multiline={true}
              name="feature"
              value={values.feature}
              style={{ margin: '1rem 0rem' }}
              onChange={handleChange}
              rows={4}
            />
            <Box maxWidth={300} mx="auto" my="1rem">
              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={values.title === '' ? true : false}
                onClick={handleSubmit}
                color="primary"
              >
                Post it
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Main;
