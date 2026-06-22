export const getInitials = (fullname: string) => {
    const [firstName, lastName] = fullname.split(" ");
    return firstName.charAt(0) + (lastName ? lastName.charAt(0) : "");
};
