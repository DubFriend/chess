#Chess

[Demo][1]

[1]: http://www.briandetering.net/chess

Installation.

create a file named "database_config.php" with your mysql database connection
settings
```php
<?php
//database connection settings
define("DATABASE_HOST", "your_host");
define("DATABASE_NAME", "database_name");
define("DATABASE_USER", "database_user");
define("DATABASE_PASS", "database_password");
?>
```

then import the table defined in the file `server/install.sql` into your database.
