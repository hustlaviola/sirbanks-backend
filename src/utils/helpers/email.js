import MailGen from 'mailgen';

// Instantiate MailGen object
export const mailGenerator = new MailGen({
    theme: 'salted',
    product: {
        name: 'Sirbanks',
        link: 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png'
    }
});

/**
 * @function otpMail
 * @description Generates body of email to be sent
 * @param {String} name - Recipient name
 * @param {String} intro - Introductory message
 * @param {Object} instructions
 * @returns {object} Email object
 */
export const otpMail = (name, intro, instructions) => {
    const email = {
        body: {
            name,
            intro,
            action: {
                instructions
            }
        }
    };
    return email;
};

/**
 * @function mail
 * @description Generates body of email to be sent
 * @param {String} name - Recipient name
 * @param {String} intro - Introductory message
 * @param {Object} action
 * @param {Object} secondAction - Second action to be performed
 * @returns {object} Email object
 */
export const mail = (name, intro, action, secondAction = undefined) => {
    const { instructions, text, link } = action;
    const actionArray = [{
        instructions,
        button: {
            color: '#33b5e5',
            text,
            link
        }
    }];
    if (secondAction) {
        actionArray.push({
            instructions: secondAction.instructions,
            button: {
                color: '#dc3545',
                text: secondAction.text,
                link: secondAction.link
            }
        });
    }
    const email = {
        body: {
            name,
            intro,
            action: actionArray
        }
    };
    return email;
};
