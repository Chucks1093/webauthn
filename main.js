import './style.css';
import { client, server } from '@passwordless-id/webauthn';
import { getNewChallenge } from './utils';
import { getAuthNUsers } from './utils';
import { v4 as uuidv4 } from 'uuid';

const registerBtn = document.querySelector('#register');
const authenticateBtn = document.querySelector('#authenticate');
const form = document.querySelector('form');


const registerUser = async (e) => {
	e.preventDefault();
	const userName = e.currentTarget.querySelector('#username').value;

	if (userName.length < 4) {
		alert('Characters should be more than 3');
		userName.value = '';
		return;
	}
	const challengeBytes = uuidv4();
	try {
		const registration = await client.register(userName.toLowerCase(), challengeBytes, {
			authenticatorType: 'auto',
			userVerification: 'required',
			timeout: 60000,
			attestation: true,
			userHandle: userName,
			debug: false,
		});
		await verifyUser(challengeBytes, registration);
	} catch (error) {
		console.error(error);
	}
};

const verifyUser = async (challenge, regObj) => {
	const expected = {
		challenge: challenge,
		origin: window.location.origin,
	};
	try {
		const registrationParsed = await server.verifyRegistration(
			regObj,
			expected
		);
		const allUsers = getAuthNUsers();
		allUsers.push(registrationParsed);
		localStorage.setItem('authnUsers', JSON.stringify(allUsers));
		alert('Authication Was successfull with WebAutN');
	} catch (error) {
		console.log(error);
	}
};

const authenticateUser = async () => {
	const userName = document.querySelector('#username').value;

	if (userName.length < 4) {
		alert('Characters should be more than 3');
		userName.value = '';
		return;
	}

	const allUsers = getAuthNUsers();
	const existingUser = allUsers.find((user) => user.username === userName.toLowerCase());
	if (!existingUser) {
		alert('User has not registered');
		return;
	}

   try {
      const challengeBytes = uuidv4();
   
      const authentication = await client.authenticate(
         [existingUser.credential.id],
         challengeBytes,
         {
            authenticatorType: 'auto',
            userVerification: 'required',
            timeout: 60000,
         }
      );

      if(!authentication) {
         alert("An unexpectd Error occured");
         return;
      }
      await authenticateOnServer(authentication, challengeBytes, existingUser.credential)

   }catch(error) {
      console.error(error)
   }
};


const authenticateOnServer = async (authentication, challenge, credentialKey)=> {

   try {
      const expected = {
         challenge: challenge,
         origin: window.location.origin,
         userVerified: true,
      };
   
      const authenticationParsed = await server.verifyAuthentication(authentication, credentialKey, expected);
      if(!authenticationParsed) {
         throw new Error("Unexpected Error Occurred");
      }
      window.location.replace(`${window.location.href}welcome.html`)



   }catch(error) {
      console.error(error)
   }


}
authenticateBtn.addEventListener('click', authenticateUser);
form.addEventListener('submit', registerUser);
