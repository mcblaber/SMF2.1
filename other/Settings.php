<?php

/**
 * The settings file contains all of the basic settings that need to be present when a database/cache is not available.
 * 
 * Simple Machines Forum (SMF)
 *
 * @package SMF
 * @author Simple Machines http://www.simplemachines.org
 * @copyright 2011 Simple Machines
 * @license http://www.simplemachines.org/about/smf/license.php BSD
 *
 * @version 2.1 Alpha 1
 */

########## Maintenance ##########
/**
 * The maintenance "mode"
 * Set to 1 to enable Maintenance Mode, 2 to make the forum untouchable. (you'll have to make it 0 again manually!)
 * 0 is default and disables maintenance mode.
 * @var int 0, 1, 2
 * @global int $maintenance
 */
$maintenance = 0;
/**
 * Title for the Maintenance Mode message.
 * @var string
 * @global int $mtitle
 */
$mtitle = 'Maintenance Mode';
/**
 * Description of why the forum is in maintenance mode.
 * @var string
 * @global string $mmessage
 */
$mmessage = 'Okay faithful users...we\'re attempting to restore an older backup of the database...news will be posted once we\'re back!';

########## Forum Info ##########
/**
 * The name of your forum.
 * @var string
 */
$mbname = 'My Community';
/**
 * The default language file set for the forum.
 * @var string
 */
$language = 'english';
/**
 * URL to your forum's folder. (without the trailing /!)
 * @var string
 */
$boardurl = 'http://127.0.0.1/smf';
/**
 * Email address to send emails from. (like noreply@yourdomain.com.)
 * @var string
 */
$webmaster_email = 'noreply@myserver.com';
/**
 * Name of the cookie to set for authentication.
 * @var string
 */
$cookiename = 'SMFCookie11';

########## Database Info ##########
/**
 * The database type
 * Default options: mysql, sqlite, postgresql
 * @var string
 */
$db_type = 'mysql';
/**
 * The server to connect to (or a Unix socket)
 * @var string
 */
$db_server = 'localhost';
/**
 * The database name
 * @var string
 */
$db_name = 'smf';
/**
 * Database username
 * @var string
 */
$db_user = 'root';
/**
 * Database password
 * @var string
 */
$db_passwd = '';
/**
 * Database user for when connecting with SSI
 * @var string
 */
$ssi_db_user = '';
/**
 * Database password for when connecting with SSI
 * @var string
 */
$ssi_db_passwd = '';
/**
 * A prefix to put in front of your table names.
 * This helps to prevent conflicts
 * @var string
 */
$db_prefix = 'smf_';
/**
 * Use a persistent database connection
 * @var int|bool
 */
$db_persist = 0;
/**
 * 
 * @var int|bool
 */
$db_error_send = 1;

########## Directories/Files ##########
# Note: These directories do not have to be changed unless you move things.
/**
 * The absolute path to the forum's folder. (not just '.'!)
 * @var string
 */
$boarddir = dirname(__FILE__);
/**
 * Path to the Sources directory.
 * @var string
 */
$sourcedir = dirname(__FILE__) . '/Sources';
/**
 * Path to the cache directory.
 * @var string
 */
$cachedir = dirname(__FILE__) . '/cache';

########## Error-Catching ##########
# Note: You shouldn't touch these settings.
$db_last_error = 0;

if (file_exists(dirname(__FILE__) . '/install.php'))
{
	header('Location: http' . (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) == 'on' ? 's' : '') . '://' . (empty($_SERVER['HTTP_HOST']) ? $_SERVER['SERVER_NAME'] . (empty($_SERVER['SERVER_PORT']) || $_SERVER['SERVER_PORT'] == '80' ? '' : ':' . $_SERVER['SERVER_PORT']) : $_SERVER['HTTP_HOST']) . (strtr(dirname($_SERVER['PHP_SELF']), '\\', '/') == '/' ? '' : strtr(dirname($_SERVER['PHP_SELF']), '\\', '/')) . '/install.php'); exit;
}

# Make sure the paths are correct... at least try to fix them.
if (!file_exists($boarddir) && file_exists(dirname(__FILE__) . '/agreement.txt'))
	$boarddir = dirname(__FILE__);
if (!file_exists($sourcedir) && file_exists($boarddir . '/Sources'))
	$sourcedir = $boarddir . '/Sources';
if (!file_exists($cachedir) && file_exists($boarddir . '/cache'))
	$cachedir = $boarddir . '/cache';

?>