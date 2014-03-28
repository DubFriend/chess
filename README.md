#Chess

[Demo][1]

[1]: http://www.briandetering.net/chess

Installation.

In the "server" folder create a file named "database_config.php" with your mysql
database connection settings.
```php
<?php
//database connection settings
define("DATABASE_HOST", "your_host");
define("DATABASE_NAME", "database_name");
define("DATABASE_USER", "database_user");
define("DATABASE_PASS", "database_password");
?>
```

Then import the table defined in the file `server/install.sql` into your database.

You may also need to adjust the variable "URL_ROOT" in `js/controller.js`.  Changes to Javascript files will need to be updated using the `grunt` command (be sure to have npm and grunt installed, and then run `npm install` from the projects root folder)

You should be able to save a game to the server, and then load that same game,
using the supplied game id.
