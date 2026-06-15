<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('WP_CACHE', true);
define( 'WPCACHEHOME', '/srv/disk13/4580169/www/formcreanum.scienceontheweb.net/wp-content/plugins/wp-super-cache/' );
define( 'DB_NAME', '4580169_wpress856b2b6c' );

/** Database username */
define( 'DB_USER', '4580169_wpress856b2b6c' );

/** Database password */
define( 'DB_PASSWORD', 'r7bEHDwm4P4wXtXQtxtRWl5TVwJTVfdA' ); 

/** Database hostname */
define( 'DB_HOST', 'fdb1030.runhosting.com' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'RJB?A};l{[E[Sy]|KwOiHa5=i|j*qKPn((ii/~Ra4`R@pRHeKn:D01=L$w3QD{5U' );
define( 'SECURE_AUTH_KEY',  'xkK4rdI2Z[TRx>u[^p1o[DfOv9AtN*WDf<+EmJnMugK[iD_ViVa+@1|:_X#Kn9vx' );
define( 'LOGGED_IN_KEY',    'Dxx;BBbaU|uV824&@Wkb;c:>AFSrs%@QlFM_Jt*FXAW3{lzJcqyuhazOUd,YNhq/' );
define( 'NONCE_KEY',        'J&YHG#t15(pAh4D@l>J7j ;rXwBbI_pn{NE/%}8!6$VBPA+[2V~6F?Z+Y)YOH3dn' );
define( 'AUTH_SALT',        '=OLB$25~:|cT<%gmnwQ+2:#y<Q0.}Zpw}?M5@?zFL{;6vDLV&0C!~E<bo7JuWLdJ' );
define( 'SECURE_AUTH_SALT', 'bd~%eL(vg$P4.;d?#iC#_h*M];ow391L/iR)NFU4FyV*HJZw%kz(~tLI&%=NYN7/' );
define( 'LOGGED_IN_SALT',   'L4|=jXt0/1ag|d~HF.u.QVtl~)AHk2mG54 BDM#1@R%A~OLas92n%LcqrgbaIW$/' );
define( 'NONCE_SALT',       '=+vu&f+K_d|ycN6KNqz5Xz-^_nL|U,5FTZs=UQ>Zx@bSH%6FNj}cyL*e-C9b(I[P' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

