class Color:
    HEADER = '\033[95m\033[4m\033[1m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    ORANGE = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    GRAY = '\033[90m'

passed = 0
failed = 0

def log_test(test_name: str, test_result: bool, color: str=None, extra_info=None):
    global passed
    global failed

    if color is None:
        # Figure out the colour by ourselves
        color = Color.GREEN if test_result else Color.RED

    print(f"{Color.BOLD}{test_name}{Color.END} - {color}{"Passed" if test_result else "Failed"}{Color.END}" + (f" {Color.GRAY}({extra_info}){Color.END}" if extra_info is not None else ""))

    if test_result:
        passed += 1
    else:
        failed += 1

def test_constants():
    """
    Tests whether constants.py loads data properly
    :return: None
    """
    print(f"{Color.HEADER}Testing Constants{Color.END}")
    import updated_backend.constants as constants

    # Notes
    log_test("Notes Present", len(constants.NOTES) == 12)

    # Interval template
    chords = ["maj", "min", "dim", "sus2", "sus4"]
    chord_types_passed = True
    for chord in chords:
        if not chord in constants.INTERVAL_TEMPLATES: chord_types_passed = False

    log_test("Interval Templates", chord_types_passed, extra_info="Old backend")

    # Chord weights
    log_test("Chord Weights", constants.CHORD_WEIGHTS is not None and type(constants.CHORD_WEIGHTS) == dict)

    # Interval weights
    log_test("Interval Weights", constants.INTERVAL_WEIGHTING is not None and type(constants.INTERVAL_WEIGHTING) == dict)

    # Sort dict
    log_test("Sorting Dictionaries", list(constants.sort_dict_by_value_desc({"A": 1, "C": 4, "B": 3}).keys()) == ["C", "B", "A"])

    print("\n")

def test_cadences():
    """
    Tests whether cadences.py loads data properly and works properly
    :return: None
    """
    import updated_backend.cadences as cadences
    print(f"{Color.HEADER}Testing Cadences{Color.END}")

    # Test if data is loading properly
    log_test("Cadence Data Loaded", cadences.CADENCES is not None and type(cadences.CADENCES) == dict)

    # Test if cadences are being added properly
    fake_data = [{"0 maj": 3, "7 maj": 2}, {"0 maj": 3, "7 maj": 1}]
    returned_data = cadences.get_cadenced_chords(fake_data)
    log_test("Cadence Function", returned_data[0]["7 maj"] > 2, extra_info=f"G major went from 2 to {returned_data[0]["7 maj"]}")

    print("\n")

def test_key_centre():
    """
    Tests whether key centre works
    :return: None
    """
    print(f"{Color.HEADER}Testing key centre{Color.END}")

    import updated_backend.key_centre as key_centre

    log_test("C major", (k:=key_centre.get_key_centre({0: 3, 7: 4, 5: 2})) == 0, extra_info=f"Detected {k}")
    log_test("Eb major", (k:=key_centre.get_key_centre({3: 5, 10: 4, 8: 5})) == 3, extra_info=f"Detected {k}")
    log_test("D minor", (k:=key_centre.get_key_centre({2: 3, 5: 6, 4: 2})) == 5, extra_info=f"Detected {k} as the relative major")
    log_test("Ab minor", (k:=key_centre.get_key_centre({11: 5})) == 11, extra_info=f"Detected {k} as the relative major")

    print("\n")

def test_template():
    """
    Tests whether constants.py loads data properly
    :return: None
    """
    print(f"{Color.HEADER}Testing template{Color.END}")
    print("\n")

if __name__ == "__main__":
    test_constants()
    test_cadences()
    test_key_centre()

    print(f"{Color.BOLD}{(passed / (passed + failed)) * 100}% of tests passed. {Color.END}\n{Color.GRAY}({Color.GREEN}{passed}{Color.GRAY} passed, {Color.RED}{failed}{Color.GRAY} failed.){Color.END}")