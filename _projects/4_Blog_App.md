---
name: Travel Blog App
tools: [React, Node.js, Express, MongoDB, Mongoose, Bootstrap]
image: assets/imgs/project/CTMS/Dynamic_TDG.png
description: This project is a travel blog app that allows users to create, read, update, and delete blog posts.
custom_js:
---

## Project Overview
In this project, I created a travel blog app that allows users to create, read, update, and delete blog posts. The app is built using the MERN stack (MongoDB, Express, React, and Node.js).

## Authentication System
The app uses a custom authentication system that I built using JSON Web Tokens (JWT). The authentication system allows users to sign up, log in, and log out. Also the system uses cookies to keep users logged in after they refresh the page. The tokens are refreshed on a regular basis to keep the user logged in for a long period of time. With every request, the token is verified to make sure the user is authenticated and refreshed if necessary.

<details>
<summary>Some code snippets for the token management system in the backend</summary>
<div class="ml-4 mr-4 mt-2">
{% highlight javascript %}
// Token Generation
const generateToken = (user, time, expiration = true) => {
    if (expiration)
        return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: time });
    else
        return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET);
}
{% endhighlight %}

{% highlight javascript %}
// Token Verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token is not valid");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated");
  }
}
{% endhighlight %}

{% highlight javascript %}
// Token Refresh
router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;

  // send error if there is no token
  if (!refreshToken) return res.status(401).json("You are not authenticated");

  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) return res.status(400).json("User not found");

    if (user.refreshToken !== refreshToken) return res.status(400).json("Refresh token is not valid");

    // verify token
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.status(403).json("Token is not valid");

      // generate new tokens
      const newAccessToken = generateToken(user);
      const newRefreshToken = generateToken(user, false);

      // update refresh token in db
      await User.findOneAndUpdate({ _id: req.body.userId }, { refreshToken: newRefreshToken });
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json("Error while refreshing token"); 
  }
});
{% endhighlight %}
</div>
</details>

<details>
<summary>Some code snippets for the token management system in the frontend</summary>
<div class="ml-4 mr-4 mt-2">
Every HTTP request is intercepted by an axios interceptor that checks if the user is authenticated and refreshes the token if necessary.

{% highlight javascript %}
axiosJWT.interceptors.request.use(
  async (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.accessToken) {
      const isValid = await tokenValid(user);
      if (!isValid) {
        const refresh = await refreshToken(user);

        user.accessToken = refresh.accessToken;
        user.refreshToken = refresh.refreshToken;
        localStorage.setItem("user", JSON.stringify(user));
      }
      config.headers["Authorization"] = "Bearer " + user.accessToken;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
{% endhighlight %}
</div>
</details>