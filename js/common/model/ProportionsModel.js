// Copyright 2019-2022, University of Colorado Boulder

/**
 * ProportionsModel is the sub-model of the Proportions graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionUtils from '../NaturalSelectionUtils.js';
import BunnyCounts from './BunnyCounts.js';
import ProportionsCounts from './ProportionsCounts.js';

class ProportionsModel extends PhetioObject {

  /**
   * @param {Property.<BunnyCounts>} liveBunnyCountsProperty - counts of live bunnies, used for dynamic 'Currently' data
   * @param {ReadOnlyProperty.<number>} clockGenerationProperty - the generation number of the generation clock
   * @param {Property.<boolean>} isPlayingProperty
   * @param {Object} [options]
   */
  constructor( liveBunnyCountsProperty, clockGenerationProperty, isPlayingProperty, options ) {

    assert && assert( liveBunnyCountsProperty instanceof Property, 'invalid bunnyCounts' );
    assert && AssertUtils.assertAbstractPropertyOf( clockGenerationProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );

    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioState: false, // to prevent serialization, because we don't have an IO Type
      phetioDocumentation: 'model elements that are specific to the Proportions feature'
    }, options );

    super( options );

    // @private
    this.clockGenerationProperty = clockGenerationProperty;

    // @public
    this.valuesVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'valuesVisibleProperty' ),
      phetioDocumentation: 'determines whether values are visible on the bars in the Proportions graph'
    } );

    // @public
    // Named proportionsGenerationProperty to distinguish it from the other 'generation' Properties in this sim.
    // See https://github.com/phetsims/natural-selection/issues/187
    this.proportionsGenerationProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      range: new Range( 0, 0 ), // dynamically adjusted by calling setValueAndRange
      tandem: options.tandem.createTandem( 'proportionsGenerationProperty' ),
      phetioDocumentation: 'the generation whose data is displayed by the Proportions graph (integer)',
      phetioReadOnly: true // range is dynamic
    } );

    // @public whether the Proportions graph is displaying the current generation. dispose is not necessary.
    this.isDisplayingCurrentGenerationProperty = new DerivedProperty(
      [ this.proportionsGenerationProperty, clockGenerationProperty ],
      ( proportionsGeneration, clockGeneration ) => ( proportionsGeneration === clockGeneration ), {
        tandem: Tandem.OPT_OUT
      } );

    // @public {Property.<BunnyCounts>} counts for 'Start of Generation'
    this.startCountsProperty = new Property( BunnyCounts.withZero(), {
      valueType: BunnyCounts,
      tandem: Tandem.OPT_OUT
    } );

    // @public {Property.<BunnyCounts>} counts for 'End of Generation'
    this.endCountsProperty = new Property( BunnyCounts.withZero(), {
      valueType: BunnyCounts,
      tandem: Tandem.OPT_OUT
    } );

    // 'Start' counts for the current generation. This is null until the sim enters SimulationMode.ACTIVE.
    // While in SimulationMode.ACTIVE it will always have a value.
    const currentStartCountsProperty = new Property( null, {
      tandem: options.tandem.createTandem( 'currentStartCountsProperty' ),
      phetioValueType: NullableIO( BunnyCounts.BunnyCountsIO ),
      phetioDocumentation: 'Counts at the start of the current generation'
    } );

    const previousCounts = createObservableArray( {
      tandem: options.tandem.createTandem( 'previousCounts' ),
      phetioType: createObservableArray.ObservableArrayIO( ProportionsCounts.ProportionsCountsIO ),
      phetioDocumentation: 'Start and End counts for previous generations, indexed by generation number'
    } );

    // @public Whether the model has data to display. dispose is not necessary.
    this.hasDataProperty = new DerivedProperty(
      [ currentStartCountsProperty ], currentStartCounts => !!currentStartCounts, {
        tandem: Tandem.OPT_OUT
      } );

    // Pause the sim when a generation other than the current generation is being viewed. unlink is not necessary.
    this.proportionsGenerationProperty.link( proportionsGeneration => {
      if ( proportionsGeneration !== clockGenerationProperty.value ) {
        isPlayingProperty.value = false;
      }
    } );

    // @public visibility of the column for each gene in the graph
    this.furVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'furVisibleProperty' )
    } );
    this.earsVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'earsVisibleProperty' )
    } );
    this.teethVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'teethVisibleProperty' )
    } );

    // When the sim starts playing or the current generation changes, show the current generation immediately.
    // unmultilink is not necessary.
    Multilink.multilink(
      [ isPlayingProperty, clockGenerationProperty ],
      ( isPlaying, clockGeneration ) => {
        if ( isPlaying ) {
          this.proportionsGenerationProperty.setValueAndRange( clockGeneration, new Range( 0, clockGeneration ) );
        }
      } );

    const updateEndCounts = () => {
      this.endCountsProperty.value = liveBunnyCountsProperty.value;
    };

    // Determine what data to display. unmultilink is not necessary.
    Multilink.multilink(
      [ this.proportionsGenerationProperty, currentStartCountsProperty ],
      ( proportionsGeneration, currentStartCounts ) => {

        if ( liveBunnyCountsProperty.hasListener( updateEndCounts ) ) {
          liveBunnyCountsProperty.unlink( updateEndCounts );
        }

        if ( currentStartCounts ) {

          // We have data. Decide whether to display data for the current generation or a previous generation.
          if ( proportionsGeneration === clockGenerationProperty.value ) {

            // Show static counts for the start of the current generation.
            this.startCountsProperty.value = currentStartCounts;

            // Show dynamic counts for the 'Currently' state of the current generation. unlink is handled above.
            liveBunnyCountsProperty.link( updateEndCounts );
          }
          else {

            // Show static counts for a previous generation.
            const counts = previousCounts[ proportionsGeneration ];
            assert && assert( counts.generation === proportionsGeneration, 'unexpected generation' );
            this.startCountsProperty.value = counts.startCounts;
            this.endCountsProperty.value = counts.endCounts;
          }
        }
        else {

          // There is no data, so reset the counts
          this.startCountsProperty.reset();
          this.endCountsProperty.reset();
        }
      } );

    // Create a Studio link
    this.addLinkedElement( liveBunnyCountsProperty, {
      tandem: options.tandem.createTandem( 'currentCountsProperty' )
    } );

    // @private {Property.<BunnyCounts|null>}
    this.currentStartCountsProperty = currentStartCountsProperty;

    // @private {ObservableArrayDef.<ProportionsCounts>}
    this.previousCounts = previousCounts;
  }

  /**
   * @public
   */
  reset() {
    this.valuesVisibleProperty.reset();
    this.proportionsGenerationProperty.resetValueAndRange(); // because we're using setValueAndRange
    this.startCountsProperty.reset();
    this.endCountsProperty.reset();
    this.currentStartCountsProperty.reset();
    this.previousCounts.length = 0; // use this approach because it's an ObservableArrayDef
    this.furVisibleProperty.reset();
    this.earsVisibleProperty.reset();
    this.teethVisibleProperty.reset();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }

  /**
   * Records start counts for the current generation.
   * @param {number} clockGeneration
   * @param {BunnyCounts} startCounts
   * @public
   */
  recordStartCounts( clockGeneration, startCounts ) {
    assert && assert( NaturalSelectionUtils.isNonNegativeInteger( clockGeneration ), 'invalid clockGeneration' );
    assert && assert( startCounts instanceof BunnyCounts, 'invalid startCounts' );
    assert && assert( clockGeneration === this.clockGenerationProperty.value, `${clockGeneration} is not the current generation` );

    this.currentStartCountsProperty.value = startCounts;
  }

  /**
   * Records end counts for the previous generation, using what was formerly the current generation start data.
   * @param {number} generation
   * @param {BunnyCounts} endCounts
   * @public
   */
  recordEndCounts( generation, endCounts ) {
    assert && assert( NaturalSelectionUtils.isNonNegativeInteger( generation ), 'invalid generation' );
    assert && assert( endCounts instanceof BunnyCounts, 'invalid endCounts' );
    assert && assert( generation === this.clockGenerationProperty.value - 1, `${generation} is not the previous generation` );
    assert && assert( this.previousCounts.length === generation,
      `unexpected generation=${generation}, expected ${this.previousCounts.length}` );

    const startCounts = this.currentStartCountsProperty.value;
    this.previousCounts.push( new ProportionsCounts( generation, startCounts, endCounts ) );
  }
}

naturalSelection.register( 'ProportionsModel', ProportionsModel );
export default ProportionsModel;