(function () {

    'use strict';

    // GOALS section
    function reqSavings() {
        var birthDate, todaysDate, retirementAge,
            annualExpenses = document.getElementById("annualExpenses").value,
            withdrawalRate = document.getElementById("withdrawalRate").value,
            calcSavings    = document.getElementById("calculatedSavings"),
            calcAge        = document.getElementById("calculatedAge");

        // assign date objects to date-specific variables
        birthDate  = new Date(document.getElementById("birthDate").value);
        todaysDate = new Date();

        // calculate & display required nest egg
        calcSavings.innerHTML = '$' + (annualExpenses / withdrawalRate).toFixed(2);

        // calculate & display age in years
        // note: dates are in milliseconds; have to convert to years
        calcAge.innerHTML = (Math.floor((todaysDate - birthDate) / 31536000000));
    }

    document.getElementById("req-savings")
        .addEventListener("click", reqSavings);

    // future value calculator
    function calcFV() {
        var birthDate = new Date(document.getElementById("birthDate").value),
            todaysDate = new Date(),
            calculatedAge = (Math.floor((todaysDate - birthDate) / 31536000000)),
            retAge = document.getElementById("retirementAge").value,
            rate = document.getElementById("FVrate").value,
            nper = retAge - calculatedAge,
            pmt = document.getElementById("FVpmt").value,
            pv = document.getElementById("FVpv").value,
            fv;

        // next line takes traditional negative PMT and PV inputs
        // fv = -((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper))); 

        // next line takes positive PMT and PV inputs
        fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));

        document.getElementById("calculatedFV")
            .innerHTML = '$' + Math.abs(fv.toFixed(2));
        
        document.getElementById("FVnper")
            .innerHTML = nper;
    }
    
    document.getElementById("FV-button")
        .addEventListener("click", calcFV);
    
    
    function solveRate(nper, ratePmt, pv, fv, type, guess) {
        // rate(nper, ratePmt, pv, fv, type, guess);
            
        if (guess === null) {
            guess = 0.01;
        }
        if (fv === null) {
            fv = 0;
        }
        if (type === null) {
            type = 0;
        }

        var FINANCIAL_MAX_ITERATIONS = 128, //Bet accuracy with 128
            FINANCIAL_PRECISION = 0.0000001; //1.0e-8

        var y, y0, y1, x0, x1 = 0,
            f = 0,
            i = 0;
        var rate = guess;
        if (Math.abs(rate) < FINANCIAL_PRECISION) {
            y = pv * (1 + nper * rate) + ratePmt * (1 + rate * type) * nper + fv;
        } else {
            f = Math.exp(nper * Math.log(1 + rate));
            y = pv * f + ratePmt * (1 / rate + type) * (f - 1) + fv;
        }
        y0 = pv + ratePmt * nper + fv;
        y1 = pv * f + ratePmt * (1 / rate + type) * (f - 1) + fv;

        // find root by Newton secant method
        i = x0 = 0.0;
        x1 = rate;
        while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
            rate = (y1 * x0 - y0 * x1) / (y1 - y0);
            x0 = x1;
            x1 = rate;

            if (Math.abs(rate) < FINANCIAL_PRECISION) {
                y = pv * (1 + nper * rate) + ratePmt * (1 + rate * type) * nper + fv;
            } else {
                f = Math.exp(nper * Math.log(1 + rate));
                y = pv * f + ratePmt * (1 / rate + type) * (f - 1) + fv;
            }

            y0 = y1;
            y1 = y;
            i += 1;
        }
        return rate;
    }

    // RATE calculator
    var calcRATE = function () {
        
        var birthDate = new Date(document.getElementById("birthDate").value),
            todaysDate = new Date(),
            calculatedAge = (Math.floor((todaysDate - birthDate) / 31536000000)),
            retAge = document.getElementById("retirementAge").value,
            nper = retAge - calculatedAge,
            annualExpenses = document.getElementById("annualExpenses").value,
            withdrawalRate = document.getElementById("withdrawalRate").value,
            fv = annualExpenses / withdrawalRate,
            ratePmt = document.getElementById("RatePmt").value,
            pv = document.getElementById("RatePV").value,
            RateCalcdSavings = document.getElementById("RateSavings").value;
        
        
        document.getElementById("RateSavings").innerHTML = '$' + fv;
        document.getElementById("RateMnthlySavings").innerHTML = '$' + (ratePmt / 12).toFixed(2);
        
        // the moneyshot
        document.getElementById("RateReqRate")
            .innerHTML = (100 * solveRate(nper, -ratePmt, -pv, fv, null, null)).toFixed(2) + ' %';

    };
    
    document.getElementById("RATE-button")
        .addEventListener("click", calcRATE);
    
}());