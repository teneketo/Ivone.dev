﻿import React, { useState, useEffect } from 'react';
import BudgetBox from '@/components/ui/budget-box';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { sendUpdate, onReceiveUpdate } from './signalr';
import Table from '@/components/ui/table';
import * as Slider from '@radix-ui/react-slider';

const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};


export default function MortgageCalculator() {

    const EUR_TO_BGN = 1.96;
    const BGN_TO_EUR = 1 / EUR_TO_BGN;
    const [loanTerm, setLoanTerm] = useState(30); // Default to 30 Years
    const [deposit, setDeposit] = useState(0.20); // Pre-select 20%
    const [totalCost, setTotalCost] = useState('251000');
    const [currency, setCurrency] = useState('EUR');
    const [monthlyPayments, setMonthlyPayments] = useState({});
    const [depositAmount, setDepositAmount] = useState(0);
    const [mortgageAmount, setMortgageAmount] = useState(0);
    const [parkSpot, setParkSpot] = useState(27000); // Pre-set to 27000
    const [commissionRate, setCommissionRate] = useState(0.036); // Pre-set to 3.6%
    const [lawyerFeeRate, setLawyerFeeRate] = useState(0.04); // Pre-set to 4%
    const exchangeRate = 1.96; // 1 EUR = 1.96 BGN


    //API
    const [appData, setAppData] = useState(window.appData || []);
    const [selectedId, setSelectedId] = useState(null);
    const [currentName, setCurrentName] = useState("Mortgage Calculator");
    const [editMode, setEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const loadData = (id) => {
        const selectedEntry = appData.find(item => item.id === parseInt(id, 10));
        if (selectedEntry) {
            // Update all the relevant state variables
            setSelectedId(selectedEntry.id);
            setCurrentName(selectedEntry.name);
            setTotalCost(selectedEntry.totalCost.toString());
            setDeposit(selectedEntry.depositPercentage / 100); // Convert to decimal if needed
            setDepositAmount(selectedEntry.depositAmount);
            setMortgageAmount(selectedEntry.mortgageAmount);
            setParkSpot(selectedEntry.parkingSpotCost);
            setCommissionRate(selectedEntry.commissionRate / 100);
            setLawyerFeeRate(selectedEntry.lawyerFeeRate / 100);
            setLoanTerm(selectedEntry.loanTermInYears);
            setCurrency(selectedEntry.currency);
        }
    };


    const saveData = () => {
        if (!isDirty) return;

        // Prepare the payload using existing variable names
        const dataToSend = {
            id: selectedId || 0,
            name: currentName,
            totalCost: parseFloat(totalCost),  // totalCost is stored as a string, so convert it to a number
            depositPercentage: deposit * 100, // deposit is stored as a decimal (e.g., 0.2 for 20%)
            depositAmount: depositAmount,     // already calculated and stored
            mortgageAmount: mortgageAmount,   // already calculated and stored
            parkingSpotCost: parkSpot,        // pre-set value from your state
            commissionRate: commissionRate * 100, // convert to percentage format (e.g., 3.6 instead of 0.036)
            commissionAmount: (commissionRate * totalCost), // calculate commission amount if needed
            lawyerFeeRate: lawyerFeeRate * 100, // convert to percentage format (e.g., 4 instead of 0.04)
            lawyerFeeAmount: (lawyerFeeRate * totalCost),   // calculate lawyer fee amount if needed
            loanTermInYears: loanTerm,         // directly from your loanTerm state
            currency: currency                 // already stored in state
        };

        if (selectedId) {
            // Update existing entry
            fetch(`/api/mortgages/${selectedId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            }).then(() => {
                setIsDirty(false);
            });
        } else {
            // Add new entry
            fetch('/api/mortgages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            }).then(() => {
                setIsDirty(false);
            });
        }
    };


    const deleteData = () => {
        if (!selectedId) return;
        fetch(`/api/mortgages/${selectedId}`, { method: 'DELETE' })
            .then(() => {
                // Remove the deleted item from appData
                setAppData((prevData) => prevData.filter((item) => item.id !== selectedId));
                // Reset the form state to "New..."
                setSelectedId(null);
                setCurrentName("Mortgage Calculator");
                setTotalCost('251000');
                setDeposit(0.20);
                setDepositAmount(0);
                setMortgageAmount(0);
                setParkSpot(27000);
                setCommissionRate(0.036);
                setLawyerFeeRate(0.04);
                setLoanTerm(30);
                setCurrency("EUR");
            });
    };



    // Recalculate when dependencies change
    useEffect(() => {
        calculateMortgage(totalCost, deposit);
    }, [totalCost, deposit, parkSpot, commissionRate, lawyerFeeRate, loanTerm]);

    // SignalR Listener for Real-Time Updates
    useEffect(() => {
        onReceiveUpdate((key, value) => {
            switch (key) {
                case 'totalCost':
                    setTotalCost(value);
                    break;
                case 'deposit':
                    setDeposit(value);
                    break;
                case 'parkSpot':
                    setParkSpot(value);
                    break;
                case 'commissionRate':
                    setCommissionRate(value);
                    break;
                case 'lawyerFeeRate':
                    setLawyerFeeRate(value);
                    break;
                case 'loanTerm':
                    setLoanTerm(value);
                    break;
                default:
                    break;
            }
        });
    }, []);

    const convertCurrency = (value) => value * exchangeRate;

    const calculateMortgage = (cost, deposit) => {
        const totalWithParking = parseFloat(cost) + parseFloat(parkSpot);
        const depositAmount = totalWithParking * deposit;
        const mortgageAmount = totalWithParking - depositAmount;
        setDepositAmount(depositAmount);
        setMortgageAmount(mortgageAmount);

        const payments = loanTerm * 12;  // Dynamically use the selected loan term
        const interestRates = [0.022, 0.03, 0.035, 0.04, 0.045, 0.05];
        const pmt = (rate, nper, pv) => {
            return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
        };

        const calculatedPayments = {};
        interestRates.forEach(rate => {
            const monthlyRate = rate / 12;
            const payment = pmt(monthlyRate, payments, mortgageAmount);
            calculatedPayments[rate] = Math.round(payment);
        });
        setMonthlyPayments(calculatedPayments);
    };


    const handleCostChange = (e) => {
        const cost = e.target.value;
        setTotalCost(cost);
        sendUpdate('totalCost', cost);
    };

    const handleDepositChange = (value) => {
        setDeposit(value);
    };

    const handleParkSpotChange = (e) => {
        const value = e.target.value;
        setParkSpot(value);
        sendUpdate('parkSpot', value);
    };

    const handleCommissionChange = (e) => {
        const value = (parseFloat(e.target.value) / 100).toFixed(2);
        setCommissionRate(value);
        sendUpdate('commissionRate', value);
    };

    const handleLawyerFeeChange = (e) => {
        const value = (parseFloat(e.target.value) / 100).toFixed(2);
        setLawyerFeeRate(value);
        sendUpdate('lawyerFeeRate', value);
    };

    const handleLoanTermChange = (e) => {
        const value = (parseFloat(e[0])).toFixed(2);
        setLoanTerm(value);
        sendUpdate('loanTerm', value);
    };


    const commissionAmount = (parseFloat(totalCost) + parseFloat(parkSpot)) * commissionRate;
    const lawyerFeeAmount = (parseFloat(totalCost) + parseFloat(parkSpot)) * lawyerFeeRate;

    const breakdownColumns = ["Description", "EUR 🇪🇺", "BGN 🇧🇬"];
    const breakdownData = [
        ["Total Cost", formatNumber(parseFloat(totalCost) + parseFloat(parkSpot)), formatNumber(convertCurrency(parseFloat(totalCost) + parseFloat(parkSpot)))],
        ["Deposit Amount", formatNumber(depositAmount), formatNumber(convertCurrency(depositAmount))],
        ["Mortgage Amount", formatNumber(mortgageAmount), formatNumber(convertCurrency(mortgageAmount))],
        ["Commission", formatNumber(commissionAmount), formatNumber(convertCurrency(commissionAmount))],
        ["Lawyer Fee", formatNumber(lawyerFeeAmount), formatNumber(convertCurrency(lawyerFeeAmount))],
    ];

    
    const paymentColumns = ["Rate (%)", "2.2", "3.0", "3.5", "4.0", "4.5", "5.0"];
    const paymentData = [
        ["EUR 🇪🇺", ...Object.values(monthlyPayments).map(formatNumber)],
        ["BGN 🇧🇬", ...Object.values(monthlyPayments).map(convertCurrency).map(formatNumber)],
    ];
    return (
        <Card className="p-6 max-w-4xl mx-auto">
            <CardContent>
                <div className="mb-4 p-4 rounded border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        {editMode ? (
                            <input
                                value={currentName}
                                onChange={(e) => {
                                    setCurrentName(e.target.value);
                                    setIsDirty(true);
                                }}
                                onBlur={() => setEditMode(false)}
                                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200 w-80" // Increased width
                            />
                        ) : (
                            <h2
                                className="text-xl font-bold cursor-pointer w-80 truncate" // Increased width
                                onClick={() => setEditMode(true)}
                            >
                                {currentName}
                            </h2>
                        )}


                        {appData.length > 0 && (
                            <select
                                onChange={(e) => {
                                    const id = e.target.value;
                                    if (id === "new") {
                                        setSelectedId(null);
                                        setCurrentName("New Mortgage");
                                        setTotalCost('251000');
                                        setDeposit(0.20);
                                        setDepositAmount(0);
                                        setMortgageAmount(0);
                                        setParkSpot(27000);
                                        setCommissionRate(0.036);
                                        setLawyerFeeRate(0.04);
                                        setLoanTerm(30);
                                        setCurrency("EUR");
                                    } else {
                                        loadData(id);
                                    }
                                }}
                                value={selectedId || "new"}
                                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                            >
                                <option value="new">New...</option>
                                {appData.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {entry.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {selectedId && (
                            <button
                                onClick={deleteData}
                                className="px-3 py-1 text-white bg-red-500 hover:bg-red-600 rounded focus:outline-none focus:ring focus:ring-red-200"
                            >
                                Delete
                            </button>
                        )}

                        {isDirty && (
                            <button
                                onClick={saveData}
                                className="px-3 py-1 text-white bg-green-500 hover:bg-green-600 rounded focus:outline-none focus:ring focus:ring-green-200"
                            >
                                Save
                            </button>
                        )}
                    </div>
                </div>

                <BudgetBox />



                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label>Total Cost</label>
                        <Input
                            placeholder="Total Cost"
                            value={totalCost}
                            onChange={handleCostChange}
                            className="mb-4 w-full"
                        />
                    </div>
                    <div className="w-1/2">
                        <label>Parking Spot</label>
                        <Input
                            placeholder="Park Spot"
                            value={parkSpot}
                            onChange={handleParkSpotChange}
                            className="mb-4 w-full"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label>Commission Rate (%)</label>
                        <Input
                            type="number"
                            placeholder="Commission Rate (%)"
                            value={(commissionRate * 100).toFixed(1)}
                            onChange={handleCommissionChange}
                            className="mb-4 w-full"
                        />
                    </div>
                    <div className="w-1/2">
                        <label>Lawyer Fee Rate (%)</label>
                        <Input
                            type="number"
                            placeholder="Lawyer Fee Rate (%)"
                            value={(lawyerFeeRate * 100).toFixed(1)}
                            onChange={handleLawyerFeeChange}
                            className="mb-4 w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    <div className="w-3/4">
                        <label>Deposit Percentage</label>
                        <Select
                            value={deposit.toFixed(2)}
                            onValueChange={(value) => {
                                const numericValue = parseFloat(value);
                                if (!isNaN(numericValue)) {
                                    handleDepositChange(numericValue);
                                } else {
                                    console.error('Invalid value selected for deposit:', value);
                                }
                            }}

                            defaultValue="0.20" // Explicitly set the default value as string
                            className="w-full"
                        >
                            <SelectTrigger>
                                {(deposit * 100).toFixed(0)}% Deposit
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0.00">0%</SelectItem>
                                <SelectItem value="0.05">5%</SelectItem>
                                <SelectItem value="0.10">10%</SelectItem>
                                <SelectItem value="0.20">20%</SelectItem>
                                <SelectItem value="0.30">30%</SelectItem>
                                <SelectItem value="0.40">40%</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-1/4">
                        <label className="block mb-1">Loan Term: {loanTerm} Years</label>
                        <Slider.Root
                            className="relative flex items-center select-none touch-none w-full h-4"
                            value={[loanTerm]}
                            onValueChange={handleLoanTermChange}
                            min={20}
                            max={35}
                            step={1}
                        >
                            <Slider.Track className="bg-gray-300 relative flex-grow rounded-full h-1">
                                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                            </Slider.Track>
                            <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md border border-gray-300 hover:bg-gray-100" />
                        </Slider.Root>
                    </div>
                </div>


             

                <br/>
                <Table
                    columns={breakdownColumns}
                    data={breakdownData}
                />

                <br/>
                <Table
                    columns={paymentColumns}
                    data={paymentData}
                />


            </CardContent>
        </Card>
    );


   
    //Budget - Deposit - XXXXX if more than that - cell is red
    
}
