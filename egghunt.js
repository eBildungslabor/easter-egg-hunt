/**
 * Easter Egg hunt code
 * copyright (c) 2020 David Sturman, all rights reserved
 * MIT licence - https://opensource.org/licenses/MIT
 *
 * Instructions:
 * - Include this file with <script src="egghunt.js"></script> on any page
 *     on which you put Easter eggs.
 * - Set the total number of eggs, the URL for the "success" page, and "mode"
 *   by calling egghunt.set(number_of_eggs, url, mode).
 *   Mode is "on", "off", or "test". Default is off.
 *   If "on", eggs are visible (if you used the class="egghunt", see below).
 *   If "off", eggs are invisible - default
 *   If "test", eggs are visible if the URL has a "egghunt" parameter.
 *   For an example with 10 eggs:
 *        <script>egghunt.set(10, "success.html", "test")</script>
 *   Eggs will appear if the url is http://mysite.com/?egghunt
 *
 * - You can use any clickable element (such as images) for eggs.
 * - Give easter eggs class="egghunt" and onclick="egghunt.record(1)"
 *     where the number 1 is replaced with a unique number for
 *     each egg starting at 0. Make sure you don't skip any numbers.
 *     Example:
 *        <img src="egg.png" class="egghunt" onclick="egghunt.record(0)">
 *     Use the class to make eggs invisible before Easter and then visible on Easter.
 *
 * - The code keeps track of how long it took to someone to find all the eggs.
 *   This is called the score.
 *   There are several ways to find out someone's score.
 *   1) The success page will be passed a parameter called SQF_BUNNIES
 *     (compatible with SquareSpace). It is an encoded version of the number
 *     of milliseconds it took for the person to find all the eggs.
 *     Example:
 *       Your success page will be called with
 *       http://www.domain.com/success?SQF_BUNNIES=DMTQ1ODkz
 *     This can be decoded with egghunt.decode().
 *       egghunt.decode("DMTQ1ODkz") will return 145893 (2 min 26 seconds)
 *   2) The javascript will automatically put the score in a page element with id="eggscore".
 *     Example:
 *        <div>It took you <span id=eggscore></span></div>
 *     will become
 *        It took you 10 minutes and 3 seconds
 *
 * - Note: Easter eggs and times are kept in an cookie called "eehr".
 *
 */

var egghunt = {
    egghunt: this,
    neggs: 7,
    success: "easter-egg-hunt",
    basetime: 1585526400,
    cookiename: "eehr",
    mode: "off",

    set: function (neggs, url, mode) {
        this.neggs = neggs;
        this.success = url;
        this.mode = mode;
    },

    record: function (eggnumber) {
        let eggsfound, start, end, count
        let eehr = this.readCookie(this.cookiename);
        let now = Date.now() - this.basetime;
        let alleggs = 2 ** this.neggs - 1;
        let nice = ["Super!", "Toll!", "Wunderbar!", "Gut gemacht!", "Großartig!"]
        nice = nice[Math.floor(Math.random() * nice.length)]

        eggnumber = 1 << eggnumber;

        if (eehr.length <= 0) {
            // first egg found
            this.cookieEgg(eggnumber, now, now, 1)
            this.showPopUp(nice + "<br>Du hast das erste Osterei gefunden!");
        } else {
            // subsequent egg found
            // console.log(eehr);
            [eggsfound, start, end, count] = eehr.split(',');
            // console.log(eggsfound, eggnumber, eggsfound | eggnumber, eggsfound | eggnumber);
            if (eggsfound & eggnumber) {
                this.showPopUp("Dieses Osterei hattest Du bereits gefunden.");
            } else {
                // console.log(eggsfound, eggnumber, eggsfound | eggnumber);
                eggsfound = eggsfound | eggnumber;
                count++
                this.cookieEgg(eggsfound, start, now, count)
                if (eggsfound === alleggs) {
                    window.location.href = this.success + "?SQF_BUNNIES=" +
                        this.encode(this.msScore());
                } else {
                    let msg = nice + "<br>";
                    msg += "Du hast nun " + count + " von " + this.neggs + " Ostereiern.";
                    this.showPopUp(msg);
                }
            }
        }
    },

    cookieEgg: function (eggnumber, start, end, count) {
        value = eggnumber + "," + start + "," + end + "," + count;
        this.setCookie("eehr", value);
    },

    // Set a session cookie (a cookie with no expire date specified)
    setCookie: function (name, value) {
        if (value === undefined) {
            console.error("stqC.setCookie value for", name, "is undefined");
            return;
        }
        document.cookie = name + "=" + value + "; path=/";
    },

    // Read cookies
    // from http://stackoverflow.com/questions/5639346/
    readCookie: function (name) {
        let c = "";
        let b = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
        if (b) {
            c = b.pop();
            if (typeof c === "undefined") { c = ""; }
        }
        return c;
    },

    showPopUp: function (text) {
        let popup = document.getElementById("EasterPopUp");
        popup.style.display = "block";
        popup.innerHTML = text;
        setTimeout(function () {
            popup.style.display = "none";
        }, 5000);
    },

    msScore: function () { // score in milliseconds
        let score = 0,
            eehr = this.readCookie(this.cookiename);
        if (eehr.length > 0) {
            let eggsfound, start, end, count;
            [eggsfound, start, end, count] = eehr.split(',');
            score = end - start
        }
        return score;
    },

    encode: function (score) { // encodes the score with btoa preceded by a random letter
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 24)] + btoa(score);
    },

    decode: function (score) { // returns the number of milliseconds of the encoded score
        return atob(score.substr(1));
    },

    displayScore: function () {
        let scoreblock = document.getElementById("eggscore"),
            score = "",
            eehr = this.readCookie(this.cookiename);
        if (scoreblock === null) {
            return "";
        }
        if (eehr.length > 0) {
            let eggsfound, start, end, count;
            [eggsfound, start, end, count] = eehr.split(',');
            let seconds = Math.round((end - start) / 1000) % 60;
            let minutes = Math.floor((end - start) / 60000);
            if (minutes > 0) {
                score += minutes;
                if (minutes === 1) {
                    score += " Minute";
                } else {
                    score += " Minuten";
                }
            }
            if (seconds > 0) {
                if (minutes > 0) {
                    score += " und ";
                }
                score += seconds;
                if (seconds === 1) {
                    score += " Sekunde";
                } else {
                    score += " Sekunden";
                }
            }
            let div = document.getElementById("eggscore");
            div.innerHTML = score;
        }
    },
};

document.addEventListener("DOMContentLoaded", startEasterEggHunt);
function startEasterEggHunt() {
    // add the message overlay to the body
    let popup = document.createElement("div");
    popup.setAttribute("id", "EasterPopUp");
    document.body.appendChild(popup);
    // dialog box is typically 390px wide and 60px high
    let style =
        "display:none;" +
        "position:fixed;" +
        "text-align:center;" +
        "left:" + ((window.innerWidth - 390) * 0.5) + "px;" +
        "top:" + ((window.innerHeight - 60) * 0.5) + "px;" +
        "padding:10px;" +
        "background:white;" +
        "border:2px rgb(147,113,183) solid;" +
        "font-family: calluna;" +
        "font-size:30px;" +
        "-webkit-box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);" +
        "-moz-box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);" +
        "box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);" +
        "z-index: 100;" +
        "";
    popup.setAttribute("style", style);

    // do we display eggs?
    mode = "none"
    if (egghunt.mode === "on") {
        mode = "inline";
    } else if (egghunt.mode === "test") {
        const urlParams = new URLSearchParams(window.location.search);
        if ( urlParams.get("egghunt") !== null) {
            mode = "inline";
        } else {
            mode = "none";
        }
    }
    let eggclass = document.querySelectorAll(".egghunt");
    eggclass.forEach(function (e) {
        e.style.display = mode;
    });

    // look to see if score is needed
    egghunt.displayScore();
}
