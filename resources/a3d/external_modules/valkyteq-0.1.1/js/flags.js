


/**
 * SET ITEM FLAG
 * ----------------
 * ----------------
 * @param {String} Flag Needs a string as input to set it's current flag.
 * @param {String} Value Needs an integer or string as input to use it as current flag.
 * @returns {NULL} Does not return a value.
 */
function setItemFlag(Flag, Value) {

    window.localStorage.setItem(Flag, Value);

}


/**
 * GET ITEM FLAG
 * ----------------
 * ----------------
 * @param {String} Flag Needs a string as input to get it's current flag.
 * @returns {String} Returns the current flag as integer.
 */
function getItemFlag(Flag) {

    return window.localStorage.getItem(Flag);

}


/**
 * RESET ITEM FLAG
 * ----------------
 * ----------------
 * @param {String} Flag Needs a string as input which sets its flag to null.
 * @returns {NULL} Does not return a value.
 */
function resetItemFlag(Flag) {

    window.localStorage.setItem(Flag, null);

}